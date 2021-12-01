```js
const covid19 = require('covid19sk-scraper');

(async() => {
    const cases = await covid19.getHospitalizations();
    console.log(cases)
})();
```

All Methods:
- getAll
- getCases
- getAverage
- getPositivityRate
- getHospitalizations