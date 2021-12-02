const covid19 = require('../src');

(async() => {
    const cases = await covid19.getHospitalizations();
    console.log(cases)
})();