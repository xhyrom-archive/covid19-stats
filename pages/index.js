import Head from 'next/head';
import Link from 'next/link';
import { Component } from 'react';
import { Chart } from 'react-google-charts'

import { createElement } from 'react';
import ReactDOM from 'react-dom';
  
export async function getStaticProps() {
    const getCases = async(url) => {
        return Promise.all([
            fetch(url).then(res => res.json())
        ]).catch(e => {
            return { message: 'API rate limit' }
        }).then((data) => {
            return data[0];
        })
    }

    const getAllFiles = async(url) => {
        return Promise.all([
            fetch(url).then(res => res.json())
        ]).catch(e => {
            return { message: 'API rate limit' }
        }).then((data) => {
            return data[0]?.tree?.filter(f => !['.github', '.gitignore', 'README'].some(o => f.path.includes(o)) && f.path.includes('latest.json')) || { message: 'API rate limit' };
        });
    }

    const cases = await getCases('https://xhyrom.github.io/covid19-stats/latest.json');
    const files = await getAllFiles('https://api.github.com/repos/xHyroM/covid19-stats/git/trees/master?recursive=1');

    return { props: { cases, files } }
}

export default class Home extends Component {
    constructor({ cases, files }) {
        super();

        this.cases = cases;
        this.files = files;

        if(!this.cases?.message?.includes('rate limit') && process.browser) localStorage.setItem('cases', JSON.stringify(cases))
        else if(process.browser) cases = JSON.parse(localStorage.getItem('cases'));
    
        if(!this.files?.message?.includes('rate limit') && process.browser) localStorage.setItem('files', JSON.stringify(files))
        else if(process.browser) files = JSON.parse(localStorage.getItem('files'));

        if(process.browser) {
            loadAgain();
            window.onresize = loadAgain()

            function loadAgain() {
                this.renderCases();
                this.renderHospitalizations();
                this.renderPositivityRate();
                this.renderCasesNegative();
            }

        }
    }

    renderCases = async() => {
        const finalData = [
            [
                'Date',
                'AG',
                'PCR',
                'Average',
                'Total'
            ]
        ]

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 0) continue;

            finalData.push([path.join('/'), data.AG.positives_count, data.PCR.positives_count, (data.AG.average + data.PCR.average), (data.AG.positives_count + data.PCR.positives_count)])
        }

        let element = createElement(Chart, {
            data: finalData,
            options: {
                title: 'Cases',
                colors: ['#ff6384', '#35a2eb', '#32a852', '#fcba03']
            },
            chartType: "LineChart",
            loader: 'Loading Cases',
        })
        ReactDOM.render(element, document.getElementById('stats'))

        return finalData;
    }

    renderHospitalizations = async() => {
        const finalData = [
            [
                'Date',
                'Increase',
                'Intensive',
                'Ventilation',
                'Total'
            ]
        ]

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 0) continue;

            finalData.push([path.join('/'), data.hospitalizations.increase, data.hospitalizations.patient.intensive, data.hospitalizations.patient.ventilation, data.hospitalizations.total])
        }

        let element = createElement(Chart, {
            data: finalData,
            options: {
                title: 'Hospitalizations',
                colors: ['#ff6384', '#35a2eb', '#32a852', '#fcba03']
            },
            chartType: "LineChart",
            loader: 'Loading Hospitalizations'
        })
        ReactDOM.render(element, document.getElementById('stats-hospitalizations'))

        return finalData;
    }

    renderPositivityRate = async() => {
        const finalData = [
            [
                'Date',
                'AG',
                'PCR',
                'Total'
            ]
        ]

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 0) continue;

            finalData.push([path.join('/'), data.AG.positivity_rate, parseFloat(data.PCR.positivity_rate), (data.AG.positivity_rate + parseFloat(data.PCR.positivity_rate))])
        }

        let element = createElement(Chart, {
            data: finalData,
            options: {
                title: 'Positivity Rate',
                colors: ['#ff6384', '#35a2eb', '#fcba03']
            },
            chartType: "LineChart",
            loader: 'Loading Positivity Rate'
        })
        ReactDOM.render(element, document.getElementById('stats-positivity-rate'))

        return finalData;
    }

    renderCasesNegative = async() => {
        const finalData = [
            [
                'Date',
                'AG',
                'PCR',
                'Total'
            ]
        ]

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 0) continue;

            finalData.push([path.join('/'), data.AG.negatives_count, data.PCR.negatives_count, (data.AG.negatives_count + data.PCR.negatives_count)])
        }

        let element = createElement(Chart, {
            data: finalData,
            options: {
                title: 'Negative Cases',
                colors: ['#ff6384', '#35a2eb', '#fcba03']
            },
            chartType: "LineChart",
            loader: 'Loading Negative Cases'
        })
        ReactDOM.render(element, document.getElementById('stats-cases-negative'))

        return finalData;
    }

    formatNumber = (number) => String(number).replace(/(.)(?=(\d{3})+$)/g,'$1,');

    render() {
        return (
            <div className='container'>
                <Head>
                    <title>Covid-19 Stats Slovakia</title>
                </Head>
    
                <main>
                    <h1 className='title'>
                        <Link href="https://www.who.int/health-topics/coronavirus">
                            <a>Covid 19</a>
                        </Link> Slovakia Statistics
                    </h1>
    
                    <div className="grid">
                        <div className="card">
                            <h3>New Cases</h3>
                            <p>
                                <font color='#ff6384'>AG: {this.formatNumber(this.cases?.AG?.positives_count)}</font><br />
                                <font color='#35a2eb'>PCR: {this.formatNumber(this.cases?.PCR?.positives_count)}</font><br />
                                <font color='#32a852'>Average: {this.formatNumber(this.cases?.AG?.average + this.cases?.PCR?.average)}</font><br />
                                <font color='#fcba03'>Total: {this.formatNumber(this.cases?.AG?.positives_count + this.cases?.PCR?.positives_count)}</font>
                            </p>
                        </div>
    
                        <div className="card">
                            <h3>Hospitalizations</h3>
                            <p>
                                <font color='#ff6384'>Increase: {this.formatNumber(this.cases?.hospitalizations?.increase)}</font><br />
                                <font color='#35a2eb'>Intensive: {this.formatNumber(this.cases?.hospitalizations?.patient?.intensive)}</font><br />
                                <font color='#32a852'>Ventilation: {this.formatNumber(this.cases?.hospitalizations?.patient?.ventilation)}</font><br />
                                <font color='#fcba03'>Total: {this.formatNumber(this.cases?.hospitalizations?.total)}</font>
                            </p>
                        </div>
    
                        <div className="card">
                            <h3>Positivity Rate</h3>
                            <p>
                                <font color='#ff6384'>AG: {this.cases?.AG.positivity_rate}</font><br />
                                <font color='#35a2eb'>PCR: {this.cases?.PCR.positivity_rate}</font><br />
                                <font color='#fcba03'>Total: {this.cases?.AG.positivity_rate + parseFloat(this.cases?.PCR?.positivity_rate)}</font>
                            </p>
                        </div>
    
                        <div className="card">
                            <h3>Negative Cases</h3>
                            <p>
                                <font color='#ff6384'>AG: {this.formatNumber(this.cases?.AG.negatives_count)}</font><br />
                                <font color='#35a2eb'>PCR: {this.formatNumber(this.cases?.PCR.negatives_count)}</font><br />
                                <font color='#fcba03'>Total: {this.formatNumber(this.cases?.AG?.negatives_count + this.cases?.PCR?.negatives_count)}</font>
                            </p>
                        </div>

                        <div className="card">
                            <div id="stats"></div>
                        </div>

                        <div className="card">
                            <div id="stats-hospitalizations"></div>
                        </div>

                        <div className="card">
                            <div id="stats-positivity-rate"></div>
                        </div>

                        <div className="card">
                            <div id="stats-cases-negative"></div>
                        </div>
                    </div>

                    <footer>
                        <br />
                        Powered by <Link href='https://github.com/Institut-Zdravotnych-Analyz/covid19-data'><a>Institut-Zdravotnych-Analyz</a></Link><br />
                        Raw source <Link href='https://github.com/xHyroM/covid19-stats'><a>GitHub</a></Link><br />
                        Updated at {this.cases?.AG?.updated_at}
                    </footer>
                </main>

                <style jsx>{`
                .row {
                    margin:0 !important;
                  }

                    .container {
                    min-height: 100vh;
                    padding: 0 0.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    }
    
                    main {
                    padding: 5rem 0;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    }
    
                    footer {
                    width: 100%;
                    height: 100px;
                    border-top: 1px solid #eaeaea;
                    text-align: center;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    }
    
                    footer img {
                    margin-left: 0.5rem;
                    }
    
                    a {
                    color: inherit;
                    text-decoration: none;
                    }
    
                    footer a,
                    .description a,
                    .title a {
                    color: #0070f3;
                    text-decoration: none;
                    }
    
                    footer a:hover,
                    footer a:focus,
                    footer a:active,
                    .description a:hover,
                    .description a:focus,
                    .description a:active,
                    .title a:hover,
                    .title a:focus,
                    .title a:active {
                    text-decoration: underline;
                    }
    
                    .title {
                    margin: 0;
                    line-height: 1.15;
                    font-size: 4rem;
                    }
    
                    .title,
                    .description {
                    text-align: center;
                    }
    
                    .description {
                    line-height: 1.5;
                    font-size: 1.5rem;
                    }
    
                    code {
                    background: #fafafa;
                    border-radius: 5px;
                    padding: 0.75rem;
                    font-size: 1.1rem;
                    font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
                        DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
                    }
    
                    .grid {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-wrap: wrap;
    
                    max-width: 1000px;
                    margin-top: 3rem;
                    }
    
                    .card {
                    margin: 1rem;
                    flex-basis: 45%;
                    padding: 1.5rem;
                    text-align: left;
                    color: inherit;
                    text-decoration: none;
                    border: 1px solid #eaeaea;
                    border-radius: 10px;
                    transition: color 0.15s ease, border-color 0.15s ease;
                    }
    
                    .card:hover,
                    .card:focus,
                    .card:active {
                    color: #0070f3;
                    border-color: #0070f3;
                    }
    
                    .card h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1.5rem;
                    }
    
                    .card p {
                    margin: 0;
                    font-size: 1.25rem;
                    line-height: 1.5;
                    }
    
                    .logo {
                    height: 1em;
                    }
    
                    @media (max-width: 600px) {
                    .grid {
                        width: 100%;
                        flex-direction: column;
                    }
                    }
                `}</style>
    
                <style jsx global>{`
                    html,
                    body {
                    padding: 0;
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                        Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                        sans-serif;
                    }
    
                    * {
                    box-sizing: border-box;
                    }
                `}</style>
            </div>
        )
    }
}