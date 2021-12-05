import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { Component, Fragment } from 'react';
import { Chart } from 'react-google-charts'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
            return data[0]?.tree?.filter(f => !['.github', '.gitignore', 'README','Czechia'].some(o => f.path.includes(o)) && f.path.includes('latest.json')) || { message: 'API rate limit' };
        });
    }

    const cases = await getCases('https://xhyrom.github.io/covid19-stats/states/Slovakia/latest.json');
    const files = await getAllFiles('https://api.github.com/repos/xHyroM/covid19-stats/git/trees/master?recursive=1');

    return { props: { cases, files } }
}

export default class Home extends Component {
    constructor({ cases, files }) {
        super();

        this.cases = cases;
        this.files = files;

        if(!this.cases?.message?.includes('rate limit') && process.browser) localStorage.setItem('cases', JSON.stringify(this.cases))
        else if(process.browser) this.cases = JSON.parse(localStorage.getItem('cases'));
    
        if(!this.files?.message?.includes('rate limit') && process.browser) localStorage.setItem('files', JSON.stringify(this.files))
        else if(process.browser) this.files = JSON.parse(localStorage.getItem('files'));

        if(process.browser) {
            loadAgain();
            this.alert();

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
                'Total',
                'Average'
            ]
        ]

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 2) continue;

            finalData.push([path.join('/').replace(/states\/Slovakia/g, ''), data.AG.positives_count, data.PCR.positives_count, (data.AG.positives_count + data.PCR.positives_count), (data.AG.average + data.PCR.average)])
        }

        let element = createElement(Chart, {
            data: finalData,
            options: {
                title: 'Cases',
                colors: ['#ff6384', '#35a2eb', '#fcba03', '#32a852'],
                seriesType: 'bars',
                series: { 3: { type: 'line' } }
            },
            chartType: "ComboChart",
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
                'Total',
                'Average'
            ]
        ]

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 2) continue;

            finalData.push([path.join('/').replace(/states\/Slovakia/g, ''), data.hospitalizations.increase, data.hospitalizations.patient.intensive, data.hospitalizations.patient.ventilation, data.hospitalizations.total, data.hospitalizations.average ?? 0])
        }

        let element = createElement(Chart, {
            data: finalData,
            options: {
                title: 'Hospitalizations',
                colors: ['#ff6384', '#35a2eb', '#eb8634', '#fcba03', '#32a852'],
                seriesType: 'bars',
                series: { 4: { type: 'line' } }
            },
            chartType: "ComboChart",
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
                'Total',
                'Average'
            ]
        ]

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 2) continue;

            finalData.push([path.join('/').replace(/states\/Slovakia/g, ''), data.AG.positivity_rate, parseFloat(data.PCR.positivity_rate), (data.AG.positivity_rate + parseFloat(data.PCR.positivity_rate)), (data.AG.positivity_rate_average + data.PCR.positivity_rate_average)])
        }

        let element = createElement(Chart, {
            data: finalData,
            options: {
                title: 'Positivity Rate',
                colors: ['#ff6384', '#35a2eb', '#fcba03', '#32a852'],
                seriesType: 'bars',
                series: { 3: { type: 'line' } }
            },
            chartType: "ComboChart",
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
                'Total',
                'Average'
            ]
        ]

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 2) continue;

            finalData.push([path.join('/').replace(/states\/Slovakia/g, ''), data.AG.negatives_count, data.PCR.negatives_count, (data.AG.negatives_count + data.PCR.negatives_count), (data.AG.negatives_average + data.PCR.negatives_average)])
        }
        

        let element = createElement(Chart, {
            data: finalData,
            options: {
                title: 'Negative Cases',
                colors: ['#ff6384', '#35a2eb', '#fcba03', '#32a852'],
                seriesType: 'bars',
                series: { 3: { type: 'line' } }
            },
            chartType: "ComboChart",
            loader: 'Loading Negative Cases'
        })
        ReactDOM.render(element, document.getElementById('stats-cases-negative'))

        return finalData;
    }

    alert = async() => {
        if(!process.browser);

        let alerts = await fetch('https://xhyrom.github.io/covid19-stats/other/website/alerts.json');
        if(!alerts.ok) alerts = JSON.parse(localStorage.getItem('alerts'));
        else {
            alerts = await alerts.json();
            localStorage.setItem('alerts', JSON.stringify(alerts));
        }

        for(const alert of alerts.messages) {
            toast[alert.type](<div dangerouslySetInnerHTML={{__html: alert.text}}></div>, {
                position: "top-right",
                autoClose: 50000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark"
            })
        }
    }

    render() {
        return (
            <div>
                <Head>
                    <title>Covid-19 Stats Slovakia</title>
                </Head>

                <main>
                    <h1 className='title'>
                        <Link href="https://www.who.int/health-topics/coronavirus">
                            <a>Covid 19</a>
                        </Link> Slovakia Statistics
                    </h1>

                    <ToastContainer/>

                    <div className="grid">
                        <div className="card">
                            <h3>New Cases</h3>
                            <p>
                                <font color='#ff6384'>AG: {this.cases?.AG?.positives_count?.toLocaleString('en-US')}</font><br />
                                <font color='#35a2eb'>PCR: {this.cases?.PCR?.positives_count?.toLocaleString('en-US')}</font><br />
                                <font color='#32a852'>Average: {(this.cases?.AG?.average + this.cases?.PCR?.average)?.toLocaleString('en-US')}</font><br />
                                <font color='#fcba03'>Total: {(this.cases?.AG?.positives_count + this.cases?.PCR?.positives_count)?.toLocaleString('en-US')}</font>
                            </p>
                        </div>
    
                        <div className="card">
                            <h3>Hospitalizations</h3>
                            <p>
                                <font color='#ff6384'>Increase: {this.cases?.hospitalizations?.increase?.toLocaleString('en-US')}</font><br />
                                <font color='#35a2eb'>Intensive: {this.cases?.hospitalizations?.patient?.intensive?.toLocaleString('en-US')}</font><br />
                                <font color='#eb8634'>Ventilation: {this.cases?.hospitalizations?.patient?.ventilation?.toLocaleString('en-US')}</font><br />
                                <font color='#32a852'>Average: {this.cases?.hospitalizations?.average?.toLocaleString('en-US')}</font><br />
                                <font color='#fcba03'>Total: {this.cases?.hospitalizations?.total?.toLocaleString('en-US')}</font>
                            </p>
                        </div>
    
                        <div className="card">
                            <h3>Positivity Rate</h3>
                            <p>
                                <font color='#ff6384'>AG: {this.cases?.AG.positivity_rate?.toLocaleString('en-US')}</font><br />
                                <font color='#35a2eb'>PCR: {this.cases?.PCR.positivity_rate?.toLocaleString('en-US')}</font><br />
                                <font color='#32a852'>Average: {(this.cases?.AG.positivity_rate_average + this.cases?.PCR.positivity_rate_average)?.toLocaleString('en-US')}</font><br />
                                <font color='#fcba03'>Total: {(this.cases?.AG.positivity_rate + this.cases?.PCR?.positivity_rate)?.toLocaleString('en-US')}</font>
                            </p>
                        </div>
    
                        <div className="card">
                            <h3>Negative Cases</h3>
                            <p>
                                <font color='#ff6384'>AG: {this.cases?.AG.negatives_count?.toLocaleString('en-US')}</font><br />
                                <font color='#35a2eb'>PCR: {this.cases?.PCR.negatives_count?.toLocaleString('en-US')}</font><br />
                                <font color='#32a852'>Average: {(this.cases?.AG.negatives_average + this.cases?.PCR.negatives_average)?.toLocaleString('en-US')}</font><br />
                                <font color='#fcba03'>Total: {(this.cases?.AG?.negatives_count + this.cases?.PCR?.negatives_count)?.toLocaleString('en-US')}</font>
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

                <Script src='https://kit.fontawesome.com/5acf4d9e80.js' crossOrigin='anonymous'></Script>
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
                    align-items: stretch | flex-start | flex-end | center | baseline | first baseline | last baseline | start | end | self-start | self-end + ... safe | unsafe;
                    justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly | start | end | left | right ... + safe | unsafe;
                    flex-wrap: wrap;
    
                    max-width: 1000px;
                    margin-top: 3rem;
                    flex-direction: row | row-reverse | column | column-reverse;
                    flex-wrap: nowrap | wrap | wrap-reverse;
                    flex-flow: row | row-reverse | column wrap;

                    gap: 10px;
                    gap: 10px 20px; /* row-gap column gap */
                    row-gap: 10px;
                    column-gap: 20px;
                    }
    
                    .card {
                    margin: 1rem;
                    flex-basis: 45%;
                    padding: 1.5rem;
                    text-align: left;
                    color: inherit;
                    order: 5;
                    flex-grow: 4; 
                    flex-shrink: 3; 
                    flex-basis:  | auto; 
                    align-self: auto | flex-start | flex-end | center | baseline | stretch;
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
            </div>
        )
    }
}
