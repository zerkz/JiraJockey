var forms = {
  country : null,

  // use the property strign and language to derive the value (default to english)
  get : function (property, locale) {
    var localeVals  = this.values[locale] || {}
      , localeVal   = localeVals && Object.keys(localeVals) && findValue(localeVals, property || '')
      , countryVals = this.values[this.country] || {}
      , countryVal  = countryVals && Object.keys(countryVals) && findValue(countryVals, property || '')
      , usVal       = findValue(this.values.us, property || '', null);

    // first try to use the provided lovale
    if (localeVal) {
      return localeVal;

    // fall back to the cookie locale
    } else if (countryVal) {
      return countryVal;

    // default to US
    } else {
      return usVal
    }
  },

  // all languages will use defaults to apply their values to teh english structure
  values : {

    // default structure and language
    us : {
      company : 'Branding Brand',
      phone   : '4123301234',
      email   : 'brand@brandingbrand.com',
      address : {
        country : 'US',
        city    : 'Pittsburgh',
        zip     : '15232',
        line1   : '123 street st',
        line2   : 'apt 2' 
      },
      name    : {
        first : 'brand',
        last  : 'brander'
      },
      cc : {
        type   : 'visa',
        cvv    : '123',
        number : '4111111111111111',
        expiration : {
          month : '5',
          year  : '2018'
        }
      }
    },

    gb : {
      address: {
        zip : 'GX11 1AA'
      }
    },

    // German
    de : {
      phone : '11111111111'
    },

    // French
    fr : {
    }, 
  }
}
