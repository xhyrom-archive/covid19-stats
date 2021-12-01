type ScraperData = Date | {
    year: String,
    month: String,
    date: string
}

interface HospitalizationsPatientData {
    intensive: number;
    ventilation: number;
}

interface HospitalitazionsData {
    increase: number;
    total: number;
    average: number;
    patient: HospitalizationsPatientData;
}

interface AGData {
    positivity_rate: number,
    id: string,
    updated_at: string,
    published_on: string,
    positives_count: number,
    negatives_count: number,
    positives_sum: number;
    negatives_sum: number;
    average: number;
    negatives_average: number;
    positivity_rate_average: number;
}

interface PCRData {
    positivity_rate: number,
    positives_count: number,
    negatives_count: number,
    average: number;
    negatives_average: number;
    positivity_rate_average: number;
}

interface getAllData {
    hospitalizations: HospitalitazionsData;
    ag: AGData;
    pcr: PCRData;
}

interface getCasesDataTest {
    positives_count: number;
    negatives_count: number;
}

interface getCasesData {
    ag: getCasesDataTest;
    pcr: getCasesDataTest;
    total: getCasesDataTest;
}

interface getPositivityRateDataPositivesCount {
    positives_count: number;
}

interface getPositivityRateData {
    ag: getPositivityRateDataPositivesCount;
    pcr: getPositivityRateDataPositivesCount;
    total: getPositivityRateDataPositivesCount;
}

interface getAverageDataTestsData {
    average: number;
    negatives_average: number;
    positivity_rate_average: number;
}

interface getAverageDataHospitalizationsData {
    average: number;
}

interface getAverageData {
    ag: getAverageDataTestsData;
    pcr: getAverageDataTestsData;
    total: getAverageDataTestsData;
    hospitalizations: getAverageDataHospitalizationsData;
}

export class Scraper {
    public getAll(path?: ScraperData): getAllData;
    public getCases(path?: ScraperData): getCasesData;
    public getPositivityRate(path?: ScraperData): getPositivityRateData;
    public getAverage(path?: ScraperData): getAverageData;
    public getHospitalizations(path?: ScraperData): HospitalitazionsData;
}