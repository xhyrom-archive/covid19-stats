class Data {
    #options;
    constructor(options) {
        this.#options = options;

        this.#options.ag = this.#options.AG;
        this.#options.pcr = this.#options.PCR;

        delete this.#options.AG;
        delete this.#options.PCR;
    }

    getAll() {
        return this.#options;
    }
    
    getCases() {
        return {
            ag: {
                positives_count: this.#options.ag.positives_count,
                negatives_count: this.#options.ag.negatives_count
            },
            pcr: {
                positives_count: this.#options.pcr.positives_count,
                negatives_count: this.#options.pcr.negatives_count
            },
            total: {
                positives_count: (this.#options.ag.positives_count + this.#options.pcr.positives_count),
                negatives_count: (this.#options.ag.negatives_count + this.#options.pcr.negatives_count)
            }
        }
    }

    getPositivityRate() {
        return {
            ag: {
                positives_count: this.#options.ag.positivity_rate
            },
            pcr: {
                positives_count: this.#options.pcr.positivity_rate
            },
            total: {
                positives_count: (this.#options.ag.positivity_rate + this.#options.pcr.positivity_rate)
            }
        }
    }

    getAverage() {
        return {
            ag: {
                average: this.#options.ag.average,
                negatives_average: this.#options.ag.negatives_average,
                positivity_rate_average: this.#options.ag.positivity_rate_average
            },
            pcr: {
                average: this.#options.pcr.average,
                negatives_average: this.#options.pcr.negatives_average,
                positivity_rate_average: this.#options.pcr.positivity_rate_average
            },
            hospitalizations: {
                average: this.#options.hospitalizations.average
            },
            total: {
                average: (this.#options.ag.average + this.#options.pcr.average),
                negatives_average: (this.#options.ag.negatives_average + this.#options.pcr.negatives_average),
                positivity_rate_average: (this.#options.ag.positivity_rate_average + this.#options.pcr.positivity_rate_average)
            }
        }
    }

    getHospitalizations() {
        return {
            patient: {
                intensive: this.#options.hospitalizations.patient.intensive,
                ventilation: this.#options.hospitalizations.patient.ventilation,
            },
            increase: this.#options.hospitalizations.increase,
            total: this.#options.hospitalizations.total
        }
    }
}

module.exports = Data;