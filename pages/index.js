import Head from 'next/head';
import Link from 'next/link';
import { Component } from 'react';
import { createElement } from 'react';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ReactDOM from 'react-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
  
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
            this.renderCases();
            this.renderHospitalizations();
        }
    }

    renderCases = async() => {
        const finalData = {
            labels: [],
            datasets: [
                {
                    label: 'AG',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
                {
                    label: 'PCR',
                    data: [],
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                },
                {
                    label: 'Total',
                    data: [],
                    borderColor: 'rgb(252, 186, 3)',
                    backgroundColor: 'rgba(252, 186, 3, 0.5)',
                },
            ],
        };

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 0) continue;

            finalData.labels.push(path.join('/'))
            finalData.datasets[0].data.push(data.AG.positives_count)
            finalData.datasets[1].data.push(data.PCR.positives_count)
            finalData.datasets[2].data.push(data.AG.positives_count + data.PCR.positives_count)
        }

        let element = createElement(Line, {
            data: finalData,
            width: 500,
            height: 300,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cases',
                    }
                }
            }
        })
        ReactDOM.render(element, document.getElementById('stats'))

        return finalData;
    }

    renderHospitalizations = async() => {
        const finalData = {
            labels: [],
            datasets: [
                {
                    label: 'Increase',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
                {
                    label: 'Intensive',
                    data: [],
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                },
                {
                    label: 'Ventilation',
                    data: [],
                    borderColor: 'rgb(50, 168, 82)',
                    backgroundColor: 'rgba(50, 168, 82, 0.5)',
                },
                {
                    label: 'Total',
                    data: [],
                    borderColor: 'rgb(252, 186, 3)',
                    backgroundColor: 'rgba(252, 186, 3, 0.5)',
                },
            ],
        };

        for(let file of this.files) {
            const data = await (await fetch(`https://xhyrom.github.io/covid19-stats/${file.path}`)).json();
            const path = file.path.split('/');
            path.pop();

            if(path.length === 0) continue;

            finalData.labels.push(path.join('/'))
            finalData.datasets[0].data.push(data.hospitalizations.increase)
            finalData.datasets[1].data.push(data.hospitalizations.patient.intensive)
            finalData.datasets[2].data.push(data.hospitalizations.patient.ventilation)
            finalData.datasets[3].data.push(data.hospitalizations.total)
        }

        let element = createElement(Line, {
            data: finalData,
            width: 500,
            height: 300,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Hospitalizations',
                    }
                }
            }
        })
        ReactDOM.render(element, document.getElementById('stats-hospitalizations'))

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
                        <a className="card">
                            <h3>New Cases</h3>
                            <p>
                                AG: {this.formatNumber(this.cases?.AG?.positives_count)}<br />
                                PCR: {this.formatNumber(this.cases?.PCR?.positives_count)}<br />
                                Average: {this.formatNumber(this.cases?.AG?.average + this.cases?.PCR?.average)}<br />
                                Total: {this.formatNumber(this.cases?.AG?.positives_count + this.cases?.PCR?.positives_count)}
                            </p>
                        </a>
    
                        <a className="card">
                            <h3>Hospitalizations</h3>
                            <p>
                                Increase: {this.formatNumber(this.cases?.hospitalizations?.increase)}<br />
                                Intensive: {this.formatNumber(this.cases?.hospitalizations?.patient?.intensive)}<br />
                                Ventilation: {this.formatNumber(this.cases?.hospitalizations?.patient?.ventilation)}<br />
                                Total: {this.formatNumber(this.cases?.hospitalizations?.total)}
                            </p>
                        </a>
    
                        <a className="card">
                            <h3>Positivity Rate</h3>
                            <p>
                                AG: {this.cases?.AG.positivity_rate}<br />
                                PCR: {this.cases?.PCR.positivity_rate}<br />
                                Total: {this.cases?.AG.positivity_rate + this.cases?.PCR?.positivity_rate}
                            </p>
                        </a>
    
                        <a className="card">
                            <h3>Negative Cases</h3>
                            <p>
                                AG: {this.cases?.AG.negatives_count}<br />
                                PCR: {this.cases?.PCR.negatives_count}<br />
                                Total: {this.cases?.AG?.negatives_count + this.cases?.PCR?.negatives_count}
                            </p>
                        </a>

                        <div id='stats'></div>
                        <div id='stats-hospitalizations'></div>
                    </div>

                    <footer>
                        <br />
                        Powered by <Link href='https://korona.gov.sk'><a>korona.gov.sk</a></Link><br />
                        Raw source <Link href='https://github.com/xHyroM/covid19-stats'><a>GitHub</a></Link><br />
                        Updated at {this.cases?.AG?.updated_at}
                    </footer>
                </main>
    
                <style jsx>{`
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
    
                    max-width: 800px;
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