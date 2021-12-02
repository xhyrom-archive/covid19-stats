```py
const { Scraper, CountryList } = require('covid19-wrapper');

(async() => {
    const cases = await Scraper.getAll(CountryList.SK);
    console.log(cases)
})();
```

All Methods:
- getAll
- getCases
- getAverage
- getPositivityRate
- getHospitalizations

Date:
```py
Scraper.getAll(CountryList.SK, new Date('December 1, 2021 00:00'))
```