import { LightningElement, wire, api, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
// import  {getSessionId}  from '@salesforce/community/session';


import createLead from '@salesforce/apex/getSlots.createLead';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
import createWorkOrder from '@salesforce/apex/getSlots.createWorkOrder';
import createCase from '@salesforce/apex/zawashHelperClass.createCase';
import getSessionId from '@salesforce/apex/stripeIntegrationHepler.getSessionId';

export default class ZaWash extends NavigationMixin(LightningElement) {

    backtoPortal(){
        // let strr=document.referrer;
        // console.log('OUTPUT : ',strr);
        window.location.replace('https://zawash.my.site.com/zaWash/s/customer-booking');
    }
  
 

    statusoptions = [
        { label: 'Problem', value: 'Problem' },
        { label: 'Feature Request	', value: 'Feature Request	' },
        { label: 'Question', value: 'Question' }
    ];

    @track paymenthMethodChoosenValues = [
        { label: 'One Time', value: 'One Time' },
        { label: 'Subscription', value: 'Subscription' }
    ];

    subscriptionMonthsOptions = [
        { label: '6 Months', value: '6' },
        { label: '12 Months', value: '12' }
    ];

    origin = '';

    @api vfPage;

    selectZawash = false;
    serviceVisible = false;
    serviceCart = false;
    appointmentBookingVisibility;
    paymentSectionVisibility = false;
    serviceSpotVisibility = false;
    subscriptionCardVisibility = false;
    bankPaymentVisibility = false;
    cardPaymentVisibility = false;
    paymentSuccessfullPageVisibility = false;
    zaWashFrontUiVisibility = true;

    paymenthMethodChoosen;
    serviceChoosen;
    serviceChoosenId;
    subTotalMiniComponentCost;// For B2C One Time Service Cost
    serviceDescription;
    subServiceCost; // For B2C Subscription Service Cost
    //customerType = 'requestQuote';bookNow
    customerType;
    @api workOrderId;
    startTime; endTime;
    customerEmail;
    numbersOfCars;
    leadId;
    dateSelected;
    subscriptionMonths;
    currentLocationCheckCounter = 0;
    searchPlaceLatitude;
    searchPlaceLongitude;
    country;
    currentLanguage;
    currentCurrency;
    listOfAddons;
    textLanguage = 'English';

    bodyText;
    ourPartnerCarParks;
    EnterYourStreet;
    months;

    countryCodeOptions;
    mobileNoEntered = '';
    selectedCountryCode;
    // loggedIn= false;



    setOptionsForCountryCode() {
        let countryCodes = ['Abkhazia(+7 840)', 'Afghanistan(+93)', 'Albania(+355)', 'Algeria(+213)', 'American Samoa(+1 684)',
            'Andorra(+376)', 'Angola(+244)', 'Anguilla(+1 264)', 'Antigua and Barbuda(+1 268)', 'Argentina(+54)', 'Armenia(+374)',
            'Aruba(+297)', 'Ascension(+247)', 'Australia(+61)', 'Australian External Territories(+672)',
            'Austria(+43)',
            'Azerbaijan(+994)',
            'Bahamas(+1 242)',
            'Bahrain(+973)',
            'Bangladesh(+880)',
            'Barbados(+1 246)',
            'Barbuda(+1 268)',
            'Belarus(+375)',
            'Belgium(+32)',
            'Belize(+501)',
            'Benin(+229)',
            'Bermuda(+1 441)',
            'Bhutan(+975)',
            'Bolivia(+591)',
            'Bosnia and Herzegovina(+387)',
            'Botswana(+267)',
            'Brazil(+55)',
            'British Indian Ocean Territory(+246)',
            'British Virgin Islands(+1 284)',
            'Brunei(+673)',
            'Bulgaria(+359)',
            'Burkina Faso(+226)',
            'Burundi(+257)',
            'Cambodia(+855)',
            'Cameroon(+237)',
            'Canada(+1)',
            'Cape Verde(+238)',
            'Cayman Islands(+ 345)',
            'Central African Republic(+236)',
            'Chad(+235)',
            'Chile(+56)',
            'China(+86)',
            'Christmas Island(+61)',
            'Cocos-Keeling Islands(+61)',
            'Colombia(+57)',
            'Comoros(+269)',
            'Congo(+242)',
            'Congo, Dem. Rep. of (Zaire)(+243)',
            'Cook Islands(+682)',
            'Costa Rica(+506)',
            'Croatia(+385)',
            'Cuba(+53)',
            'Curacao(+599)',
            'Cyprus(+537)',
            'Czech Republic(+420)',
            'Denmark(+45)',
            'Diego Garcia(+246)',
            'Djibouti(+253)',
            'Dominica(+1 767)',
            'Dominican Republic(+1 809)',
            'East Timor(+670)',
            'Easter Island(+56)',
            'Ecuador(+593)',
            'Egypt(+20)',
            'El Salvador(+503)',
            'Equatorial Guinea(+240)',
            'Eritrea(+291)',
            'Estonia(+372)',
            'Ethiopia(+251)',
            'Falkland Islands(+500)',
            'Faroe Islands(+298)',
            'Fiji(+679)',
            'Finland(+358)',
            'France(+33)',
            'French Antilles(+596)',
            'French Guiana(+594)',
            'French Polynesia(+689)',
            'Gabon(+241)',
            'Gambia(+220)',
            'Georgia(+995)',
            'Germany(+49)',
            'Ghana(+233)',
            'Gibraltar(+350)',
            'Greece(+30)',
            'Greenland(+299)',
            'Grenada(+1 473)',
            'Guadeloupe(+590)',
            'Guam(+1 671)',
            'Guatemala(+502)',
            'Guinea(+224)',
            'Guinea-Bissau(+245)',
            'Guyana(+595)',
            'Haiti(+509)',
            'Honduras(+504)',
            'Hong Kong SAR China(+852)', 'Hungary(+36)',
            'Iceland(+354)',
            'India(+91)',
            'Indonesia(+62)',
            'Iran(+98)',
            'Iraq(+964)',
            'Ireland(+353)',
            'Israel(+972)',
            'Italy(+39)',
            'Ivory Coast(+225)',
            'Jamaica(+1 876)',
            'Japan(+81)',
            'Jordan(+962)',
            'Kazakhstan(+7 7)',
            'Kenya(+254)',
            'Kiribati(+686)',
            'Kuwait(+965)',
            'Kyrgyzstan(+996)',
            'Laos(+856)',
            'Latvia(+371)',
            'Lebanon(+961)',
            'Lesotho(+266)',
            'Liberia(+231)',
            'Libya(+218)',
            'Liechtenstein(+423)',
            'Lithuania(+370)',
            'Luxembourg(+352)',
            'Macau SAR China(+853)',
            'Macedonia(+389)',
            'Madagascar(+261)',
            'Malawi(+265)',
            'Malaysia(+60)',
            'Maldives(+960)',
            'Mali(+223)',
            'Malta(+356)',
            'Marshall Islands(+692)',
            'Martinique(+596)',
            'Mauritania(+222)',
            'Mauritius(+230)',
            'Mayotte(+262)',
            'Mexico(+52)',
            'Micronesia(+691)',
            'Midway Island(+1 808)',
            'Moldova(+373)',
            'Monaco(+377)',
            'Mongolia(+976)',
            'Montenegro(+382)',
            'Montserrat(+1664)',
            'Morocco(+212)',
            'Myanmar(+95)',
            'Namibia(+264)',
            'Nauru(+674)',
            'Nepal(+977)',
            'Netherlands(+31)',
            'Netherlands Antilles(+599)',
            'Nevis(+1 869)',
            'New Caledonia(+687)',
            'New Zealand(+64)',
            'Nicaragua(+505)',
            'Niger(+227)',
            'Nigeria(+234)',
            'Niue(+683)',
            'Norfolk Island(+672)',
            'North Korea(+850)',
            'Northern Mariana Islands(+1 670)',
            'Norway(+47)',
            'Oman(+968)',
            'Pakistan(+92)',
            'Palau(+680)',
            'Palestinian Territory(+970)',
            'Panama(+507)',
            'Papua New Guinea(+675)',
            'Paraguay(+595)',
            'Peru(+51)',
            'Philippines(+63)',
            'Poland(+48)',
            'Portugal(+351)',
            'Puerto Rico(+1 787)',
            'Qatar(+974)',
            'Reunion(+262)',
            'Romania(+40)',
            'Russia(+7)',
            'Rwanda(+250)',
            'Samoa(+685)',
            'San Marino(+378)',
            'Saudi Arabia(+966)',
            'Senegal(+221)',
            'Serbia(+381)',
            'Seychelles(+248)',
            'Sierra Leone(+232)',
            'Singapore(+65)',
            'Slovakia(+421)',
            'Slovenia(+386)',
            'Solomon Islands(+677)',
            'South Africa(+27)',
            'South Georgia and the South Sandwich Islands(+500)',
            'South Korea(+82)',
            'Spain(+34)',
            'Sri Lanka(+94)',
            'Sudan(+249)', 'Suriname(+597)',
            'Swaziland(+268)',
            'Sweden(+46)',
            'Switzerland(+41)',
            'Syria(+963)',
            'Taiwan(+886)',
            'Tajikistan(+992)',
            'Tanzania(+255)',
            'Thailand(+66)',
            'Timor Leste(+670)',
            'Togo(+228)',
            'Tokelau(+690)',
            'Tonga(+676)',
            'Trinidad and Tobago(+1 868)',
            'Tunisia(+216)',
            'Turkey(+90)',
            'Turkmenistan(+993)',
            'Turks and Caicos Islands(+1 649)',
            'Tuvalu(+688)',
            'U.S. Virgin Islands(+1 340)',
            'Uganda(+256)',
            'Ukraine(+380)',
            'United Arab Emirates(+971)',
            'United Kingdom(+44)',
            'United States(+1)',
            'Uruguay(+598)',
            'Uzbekistan(+998)',
            'Vanuatu(+678)',
            'Venezuela(+58)',
            'Vietnam(+84)',
            'Wake Island(+1 808)',
            'Wallis and Futuna(+681)',
            'Yemen(+967)',
            'Zambia(+260)',
            'Zanzibar(+255)',
            'Zimbabwe(+263)'];

        let item = [];
        countryCodes.forEach(element => {
            item.push({ label: element, value: element.split('(')[1].split(')')[0] });
        });

        this.countryCodeOptions = item;
    }

    appendMobileNo(event) {
        const keyCode = event.keyCode;
        console.debug(keyCode);
        console.debug(event.target.value);

        const excludedKeys = [37, 39, 46, 16, 20, 32, 219, 221];

        if (((keyCode >= 65 && keyCode <= 90) || (excludedKeys.includes(keyCode)))) {
            event.preventDefault();
        }
        else {
            this.mobileNoEntered = event.target.value;
            this.template.querySelector('.mobileNo').value = this.mobileNoEntered;
        }

    }

    handleCountryCodeChange(event) {
        this.selectedCountryCode = event.detail.value;
    }

    parameters = {};

    selectedCurrency = 'CHF';
    currentURL;
    languageChanged(event) {

        let paramLanguages;
        if (event.target.value.split(',')[0] == 'en_US') {
            this.currentLanguage = 'USA';
            this.textLanguage = 'English';
            paramLanguages = event.target.value.split(',')[0];
        }
        if (event.target.value.split(',')[0] == 'fr_CH') {
            this.currentLanguage = 'Switzerland';
            this.textLanguage = 'French';
            if (event.target.value.split(',')[1] == 'CHF') {
                paramLanguages = 'fr_CH';
            }
            if (event.target.value.split(',')[1] == 'EUR') {
                paramLanguages = 'fr_CA';
            }
        }
        if (event.target.value.split(',')[0] == 'de_CH') {
            this.currentLanguage = 'Germany';
            this.textLanguage = 'German';
            paramLanguages = event.target.value.split(',')[0];
        }

        this.selectedCurrency = event.target.value.split(',')[1];


        getLabels({ language: this.textLanguage }).then(result => {
            result.forEach(element => {

                this.label[element.Name] = element[this.textLanguage + '__c'];

                if (this.customerType == 'bookNow') {
                    this.bodyText = this.label.bookYourCarWashAtHomeOrAt;
                }
                else {
                    if (this.customerType == 'requestQuote') {
                        this.bodyText = this.label.Book_your_car_wash_at_your_site_or;
                    }
                }

                this.EnterYourStreet = this.label.Enter_your_street;
                this.ourPartnerCarParks = this.label.our_partner_car_parks;
                if (this.serviceVisible == true) {
                    this.template.querySelector('c-choose-your-service').setChooseYourServiceValue(this.label.serviceChoose);
                }
                this.paymenthMethodChoosenValues = [
                    { label: this.label.OneTime, value: 'One Time' },
                    { label: this.label.Subscription, value: 'Subscription' }
                ];
                this.subscriptionMonthsOptions = [
                    { label: '6 ' + this.label.months, value: '6' },
                    { label: '12 ' + this.label.months, value: '12' }
                ];

                this.months = [this.label.January, this.label.February, this.label.March, this.label.April, this.label.May, this.label.June, this.label.July, this.label.August, this.label.September, this.label.October, this.label.November, this.label.December];
            });
        }).catch(error => {
        })
        // }

        //this condition change the default value of country code
        if (this.textLanguage == 'English') {
            this.selectedCountryCode = 'France(+33)';
        }
        else if (this.textLanguage == 'French') {
            this.selectedCountryCode = 'France(+33)';
        }
        else if (this.textLanguage == 'German') {
            this.selectedCountryCode = 'Germany(+49)';
        }



        this.vfPage.updateURLParameter(paramLanguages);

    }

    displayEmailPopUp() {

        if (this.currentAddress != undefined) {
            this.countryCodeOptions.forEach(element => {
                if (element.label.split('(')[0].includes(this.currentAddress.split(',')[this.currentAddress.split(',').length - 1].trim())) {
                    this.selectedCountryCode = element.value;
                }
            });
        }

        if (this.selectedCountryCode == undefined) {
            this.selectedCountryCode = '+41';
        }

        if (this.customerType == 'requestQuote') {
            this.template.querySelector('.noOfCarsInput').style.display = 'block';
            this.template.querySelector('.mobileNoDiv').style.display = 'flex';
        }
        if (window.innerWidth <= 715) {
            this.template.querySelector('.getEmail').style.margin = '100px auto auto';
        }
        else {
            this.template.querySelector('.getEmail').style.margin = '150px auto auto';
        }
        this.template.querySelector('.emailPopUp').style.display = 'block';
    }
    hideEmailPopup() {
        this.template.querySelector('c-zawash-front-ui').hideEverything();
        this.template.querySelector('.emailPopUp').style.display = 'none';
        this.template.querySelector('.emailInput').value = '';
        this.template.querySelector('.codeInput').value = '';
        this.template.querySelector('.mobileNo').value = '';
        this.template.querySelector('.EmailPopUpCombobox').value = '';
        this.template.querySelector('.subscriptionMonths').value = '';
        this.template.querySelector('.noOfCarsInput').value = '';
        this.template.querySelector('.subscriptionMonths').style.display = 'none';
        
    }

    setSelectValueCount = 0;

    getCurrentLocation() {
        if (!navigator.geolocation) {
            console.error(`Your browser doesn't support Geolocation`);
        }
        else {
            navigator.geolocation.getCurrentPosition(
                (position) => {

                    let message = JSON.stringify({
                        eventType: 'setMarker',
                        data: position.coords.latitude + ',' + position.coords.longitude,
                        zoomLevel: 18,
                        windowUrl: this.currentURL
                    });

                    const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
                    this.dispatchEvent(customEventVar1);

                    this.searchPlaceLatitude = position.coords.latitude;
                    this.searchPlaceLongitude = position.coords.longitude;

                    var requestOptions = {
                        method: 'GET',
                        redirect: 'follow'
                    };

                    fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&key=AIzaSyA50_sS8NAwy7gHeObvhFlozNW3RTxsCG8", requestOptions)
                        .then(response => response.json())
                        .then(result => {
                            this.currentAddress = result.results[0].formatted_address;
                            this.template.querySelector('c-zawash-front-ui').setAddressSearchInputValue(result.results[0].formatted_address);
                        })
                        .catch(error => { });

                    this.checkLocationandCurrency();
                    
                }
            )
        }
    }
    loginUser = false;
    handleLogOut() {
        window.open("https://zawash.my.site.com/zaWash/secur/logout.jsp", "_self");
    }

    @track label = {}
    accountId;
    connectedCallback() {
        
        // this.checkLoginStatus();
        getSessionId()
                 .then(result=>{
                     console.log('sessionIDs : ',result);
                     if(result.length>1){
                     this.loginUser = true;
                     }
                 })
        
        console.log('Connected');
        console.log(this.vfPage);
        var currentUrl = JSON.parse(JSON.stringify(this.vfPage)).url;
        // // // console.log('currentURL==>', currentUrl);
        let paramString = currentUrl.split('?')[1];
        let queryString = new URLSearchParams(paramString);
        // // // console.log('OUTPUT : ', queryString.entries());
        for (let pair of queryString.entries()) {
            if (pair[0] == 'accId') {
                // this.loginUser = true;
                
            }
        }

        if (currentUrl.includes('?')) {

            console.log('Includes ?');
            if (paramString.includes('&')) {
                console.log('Includes &')
                paramString.split('&').forEach(element => {
                    if (element.split('=')[0] == 'language') {

                        switch (element.split('=')[1]) {
                            case 'en_US':
                                this.currentLanguage = 'USA';
                                this.textLanguage = 'English';
                                setTimeout(() => {
                                    this.template.querySelector('.languages').value = 'en_US,CHF';
                                }, 0);
                                this.selectedCurrency = 'CHF';
                                this.vfPage.updateURLParameter('en_US');
                                break;

                            case 'fr_CH':
                                this.currentLanguage = 'Switzerland';
                                this.textLanguage = 'French';
                                setTimeout(() => {
                                    this.template.querySelector('.languages').value = 'fr_CH,CHF';
                                }, 0);
                                this.selectedCurrency = 'CHF';
                                this.vfPage.updateURLParameter('fr_CH');
                                break;
                            case 'fr_CA':
                                this.currentLanguage = 'Switzerland';
                                this.textLanguage = 'French';
                                setTimeout(() => {
                                    this.template.querySelector('.languages').value = 'fr_CH,EUR';
                                }, 0);
                                this.selectedCurrency = 'EUR';
                                this.vfPage.updateURLParameter('fr_CA');
                                break;
                            case 'de_CH':
                                this.currentLanguage = 'Germany';
                                this.textLanguage = 'German';
                                setTimeout(() => {
                                    this.template.querySelector('.languages').value = 'de_CH,CHF';
                                }, 0);
                                this.selectedCurrency = 'CHF';
                                this.vfPage.updateURLParameter('de_CH');
                                break;
                            default:
                                this.currentLanguage = 'USA';
                                this.textLanguage = 'English';
                                setTimeout(() => {
                                    this.template.querySelector('.languages').value = 'en_US,CHF';
                                }, 0);
                                this.selectedCurrency = 'CHF';
                                this.vfPage.updateURLParameter('en_US');
                        }

                        // if (element.split('=')[1] == 'en_US') {
                        //     this.currentLanguage = 'USA';
                        //     this.textLanguage = 'English';
                        //     setTimeout(() => {
                        //         this.template.querySelector('.languages').value = 'en_US,CHF';
                        //     }, 0);
                        // }
                        // if (element.split('=')[1] == 'fr_CH') {
                        //     this.currentLanguage = 'Switzerland';
                        //     this.textLanguage = 'French';
                        //     setTimeout(() => {
                        //         this.template.querySelector('.languages').value = 'fr_CH,CHF';
                        //     }, 0);
                        // }
                        // if (element.split('=')[1] == 'de_CH') {
                        //     this.currentLanguage = 'Germany';
                        //     this.textLanguage = 'German';
                        //     setTimeout(() => {
                        //         this.template.querySelector('.languages').value = 'de_CH,CHF';
                        //     }, 0);
                        // }
                    }
                });
            }
            else {
                console.log('Does not Includes &')
                console.log(paramString.split('=')[1]);
                if (paramString.split('=')[0] == 'language') {
                    switch (paramString.split('=')[1]) {
                        case 'en_US':
                            this.currentLanguage = 'USA';
                            this.textLanguage = 'English';
                            setTimeout(() => {
                                this.template.querySelector('.languages').value = 'en_US,CHF';
                            }, 0);
                            this.selectedCurrency = 'CHF';
                            this.vfPage.updateURLParameter('en_US');
                            break;

                        case 'fr_CH':
                            this.currentLanguage = 'Switzerland';
                            this.textLanguage = 'French';
                            setTimeout(() => {
                                this.template.querySelector('.languages').value = 'fr_CH,CHF';
                            }, 0);
                            this.selectedCurrency = 'CHF';
                            this.vfPage.updateURLParameter('fr_CH');
                            break;
                        case 'fr_CA':
                            this.currentLanguage = 'Switzerland';
                            this.textLanguage = 'French';
                            setTimeout(() => {
                                this.template.querySelector('.languages').value = 'fr_CH,EUR';
                            }, 0);
                            this.selectedCurrency = 'EUR';
                            this.vfPage.updateURLParameter('fr_CA');
                            break;
                        case 'de_CH':
                            this.currentLanguage = 'Germany';
                            this.textLanguage = 'German';
                            setTimeout(() => {
                                this.template.querySelector('.languages').value = 'de_CH,CHF';
                            }, 0);
                            this.selectedCurrency = 'CHF';
                            this.vfPage.updateURLParameter('de_CH');
                            break;
                        default:
                            this.currentLanguage = 'USA';
                            this.textLanguage = 'English';
                            setTimeout(() => {
                                this.template.querySelector('.languages').value = 'en_US,CHF';
                            }, 0);
                            this.selectedCurrency = 'CHF';
                            this.vfPage.updateURLParameter('en_US');
                    }



                    // if (paramString.split('=')[1] == 'en_US') {
                    //     this.currentLanguage = 'USA';
                    //     this.textLanguage = 'English';
                    //     setTimeout(() => {
                    //         this.template.querySelector('.languages').value = 'en_US,CHF';
                    //     }, 0);
                    // }
                    // if (paramString.split('=')[1] == 'fr_CH') {
                    //     this.currentLanguage = 'Switzerland';
                    //     this.textLanguage = 'French';
                    //     setTimeout(() => {
                    //         this.template.querySelector('.languages').value = 'fr_CH,CHF';
                    //     }, 0);
                    // }
                    // if (paramString.split('=')[1] == 'de_CH') {
                    //     this.currentLanguage = 'Germany';
                    //     this.textLanguage = 'German';
                    //     setTimeout(() => {
                    //         this.template.querySelector('.languages').value = 'de_CH,CHF';
                    //     }, 0);
                    // }
                }
            }
        }
        else {
            this.currentLanguage = 'USA';
            this.textLanguage = 'English';
            setTimeout(() => {
                this.template.querySelector('.languages').value = 'en_US,CHF';
            }, 0);
        }


        // if(queryString.entries().includes('accId')){
        //     this.loginUser=true;
        // }
        var cookies = document.cookie.split("; ");
        // //// // console.log('cookies===>',JSON.stringify(cookies));

        //if (currentUrl=='https://zawash.my.site.com/zaWash/apex/googleMaps?tour=&isdtp=p1&sfdcIFrameOrigin=https://zawash.my.site.com&nonce=&clc=0&sfdcIFrameHost=web') {
        if (currentUrl.split('/')[5][0] == '?' || currentUrl.split('/')[5][0] == undefined) {
            this.customerType = 'bookNow';
        }
        else {
            if (currentUrl.split('/')[5][0] == 'z') {
                this.customerType = 'requestQuote';
            }
            // var url = new URL(currentUrl);
            // this.accountId = url.searchParams.get("accId");
            // //// // console.log('accountId', this.accountId);
            // if(this.accountId)
            // {
            //     //// // console.log(this.accountId);
            //     this.loggedIn = true;
            // }
        }


        this.setOptionsForCountryCode();


    }

    constructor() {
        super();

        window.addEventListener('messagerfromvf', function (event) {
            let latitude = event.detail[0].split(',')[0];
            let longitude = event.detail[0].split(',')[1];

            var requestOptions = {
                method: 'GET',
                redirect: 'follow'
            };


            fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latitude + "," + longitude + "&key=AIzaSyA50_sS8NAwy7gHeObvhFlozNW3RTxsCG8", requestOptions)
                .then(response => response.json())
                .then(result => {
                    window.document.querySelector('c-za-wash').getElementsByTagName('c-zawash-front-ui')[0].setAddressSearchInputValue1(result.results[0].formatted_address, parseFloat(latitude), parseFloat(longitude));
                    this.currentAddress = result.results[0].formatted_address;
                    this.checkLocationandCurrency();
                })
                .catch(error => { });

            if (this.template.querySelector('.customerEmail').innerHTML == null || this.template.querySelector('.customerEmail').innerHTML == "" || this.template.querySelector('.customerEmail').innerHTML == undefined) {
                if (this.customerType == 'requestQuote') {
                    window.document.querySelector('c-za-wash').getElementsByClassName('noOfCarsInput')[0].style.display = 'block';
                }
                if (window.innerWidth <= 715) {
                    window.document.querySelector('c-za-wash').getElementsByClassName('getEmail')[0].style.margin = '100px auto auto';
                }
                else {
                    window.document.querySelector('c-za-wash').getElementsByClassName('getEmail')[0].style.margin = '150px auto auto';
                }
                window.document.querySelector('c-za-wash').getElementsByClassName('emailPopUp')[0].style.display = 'block';
            }
            else {
                this.serviceVisible = true;
            }

        }, false);
    }




    count = 0;
    url;
    preLang;

    renderedCallback() {
        // //// // console.log(this.paymenthMethodChoosen, this.customerType, this.currentLanguage, this.selectedCurrency +' AKF K ');

        // //// // console.log(-1);
        window.document.querySelector('html').style.overflow = 'hidden';

        // //// // console.log(0);
        //punt did it
        if (this.count == 0) {
            getLabels({ language: this.textLanguage }).then(result => {
                result.forEach(element => {
                    this.label[element.Name] = element[this.textLanguage + '__c'];

                    if (this.customerType == 'bookNow') {
                        this.bodyText = this.label.bookYourCarWashAtHomeOrAt;
                    }
                    else {
                        if (this.customerType == 'requestQuote') {
                            this.bodyText = this.label.Book_your_car_wash_at_your_site_or;
                        }
                    }
                    this.EnterYourStreet = this.label.Enter_your_street;
                    this.ourPartnerCarParks = this.label.our_partner_car_parks;

                    this.paymenthMethodChoosenValues = [
                        { label: this.label.OneTime, value: 'One Time' },
                        { label: this.label.Subscription, value: 'Subscription' }
                    ];
                    this.subscriptionMonthsOptions = [
                        { label: '6 ' + this.label.months, value: '6' },
                        { label: '12 ' + this.label.months, value: '12' }
                    ];

                    this.months = [this.label.January, this.label.February, this.label.March, this.label.April, this.label.May, this.label.June, this.label.July, this.label.August, this.label.September, this.label.October, this.label.November, this.label.December];
                });
            }).catch(error => {
                // //// // console.log(error);
                throw error;
            })

            this.count = 1;
        }


        // //// // console.log(1);

        if (this.serviceCart == true) {
            this.template.querySelector('c-service-cart').setCustomerType(this.customerType, this.numbersOfCars);
            this.template.querySelector('c-service-cart').getExtraServicesList(this.paymenthMethodChoosen, this.serviceChoosenId, this.currentLanguage, this.selectedCurrency);
            this.template.querySelector('c-service-cart').setComponentDetails(this.serviceChoosen, this.serviceIcon, this.servicePrice, this.serviceEstimatedDuration, this.serviceDescription);
        }
        // //// // console.log(2);

        if (this.appointmentBookingVisibility == true) {
            //// // console.log('custom event', this.leadId);
            console.log('Thissss.currentAddress : ' + this.currentAddress);
            this.template.querySelector('c-appointment-booking').setWorkOrderId(this.workOrderId, this.customerType, this.leadId, this.listOfAddons, this.subTotalMiniComponentCost, this.paymenthMethodChoosen, this.currentCurrency, this.country, this.subscriptionMonths, this.numbersOfCars, this.serviceChoosenId, this.currentAddress, this.mobileNoEntered, this.totalTimeTakenInService);
        }
        // //// // console.log(3);
        if (this.serviceVisible == true) {
            //// // console.log(this.paymenthMethodChoosen, this.customerType, this.currentLanguage, this.selectedCurrency +' AKF K ', 3);
            this.template.querySelector('c-choose-your-service').setPaymentMethodChoosenToServiceChooseSection(this.paymenthMethodChoosen, this.customerType, this.currentLanguage, this.selectedCurrency);
            this.template.querySelector('c-choose-your-service').setChooseYourServiceValue(this.label.serviceChoose);
        }
        // //// // console.log(4);

        if (this.cardPaymentVisibility == true) {
            this.template.querySelector('c-card-payment').setpaymentType(this.paymenthMethodChoosen, this.dateSelected, this.currentCurrency, this.country, this.workOrderId, this.startTime, this.endTime, this.leadId, this.serviceChoosen,this.subTotalMiniComponentCost);
            if (this.paymenthMethodChoosen == 'One Time') {
                // //// // console.log(this.workOrderId);
                this.template.querySelector('c-card-payment').setPaymentPrice(this.subTotalMiniComponentCost, this.serviceChoosen, this.workOrderId);
            }
            console.log('getSubscriptionMonths : ' + this.subscriptionMonths);
            if (this.subscriptionMonths != undefined) {
                this.template.querySelector('c-card-payment').getSubscriptionMonths(this.subscriptionMonths);
            }
        }
        // if (this.paymentSuccessfullPageVisibility == true) {
        //     this.serviceResourceJSON = this.template.querySelector('c-card-payment').serviceResourceJSON;
        //     console.log('zwsh service res', JSON.stringify(this.serviceResourceJSON));
        //     // this.template.querySelector('c-payment-successful-page').setserviceResourceJSON(this.serviceResourceJSON);
        // }
        if (this.subscriptionCardVisibility == true) {
            this.template.querySelector('c-subscription-card').setPaymentPrice(this.servicePrice);
        }

        if (this.serviceSpotVisibility == true) {
            if (this.paymenthMethodChoosen == 'One Time') {
                this.template.querySelector('c-service-spot').subTotalMiniComponentValues(this.subTotalMiniComponentCost);
            }
            this.template.querySelector('c-service-spot').setValuesForCreateWorkOrder(this.leadId, this.serviceChoosen, this.paymenthMethodChoosen, this.searchPlaceLatitude, this.searchPlaceLongitude, this.travel, this.currentCurrency, this.serviceChoosenId, this.currentLanguage, this.country, this.template.querySelector('c-zawash-front-ui').currentSelectedAddress, this.customerType);
        }

        // if (this.paymentSuccessfullPageVisibility == true) {
        //     this.template.querySelector('c-payment-successful-page').setserviceResourceJSON(this.serviceResourceJSON, this.finalServiceAppointmentId);
        // }

    }
    serviceResourceJSON;

    resetMarker(event) {

        let message = JSON.stringify({
            eventType: 'setMarker',
            data: event.detail[0] + ',' + event.detail[1],
            zoomLevel: 18,
            windowUrl: this.currentURL
        });

        const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
        this.dispatchEvent(customEventVar1);

        this.checkLocationandCurrency();
        // if (this.customerEmail == null || this.customerEmail == "" || this.customerEmail == undefined) {
        //     this.checkLocationandCurrency();
        // }
        // else {
        //     this.serviceVisible = true;
        // }
        this.searchPlaceLatitude = event.detail[0];
        this.searchPlaceLongitude = event.detail[1];
        this.country = event.detail[2];
    }

    notAvailable = false;
    @api sendToastevent() {
        this.notAvailable = true;
        //// // console.log('mai chala');
        alert('Sorry ! We are not providing service in your locality right now.');
        // const evt = new ShowToastEvent({
        //                 title: 'No Invoice',
        //                 message: 'Sorry ! We are not providing service in your locality right now.',
        //                 variant: 'info',
        //             });
        //             this.dispatchEvent(evt);


        const customEventVar1 = new CustomEvent('redirectFromLWC', { detail: 'detail', bubbles: true, composed: true });
        this.dispatchEvent(customEventVar1);
        //// // console.log('dispatch done');
        this.showToast();


    }
    // @track type='success';
    // @track message;
    // @track messageIsHtml=false;
    // @track showToastBar = false;
    // @api autoCloseTime = 5000;
    // @track icon='';

    // @api
    // showToast(type, message,icon,time) {
    //     this.type = type;
    //     this.message = message;
    //     this.icon=icon;
    //     this.autoCloseTime=time;
    //     this.showToastBar = true;
    //     setTimeout(() => {
    //         this.closeModel();
    //     }, this.autoCloseTime);
    // }

    // closeModel() {
    //     this.showToastBar = false;
    //     this.type = '';
    //     this.message = '';
    // }

    // get getIconName() {
    //     if(this.icon)
    //     {
    //         return this.icon;
    //     }
    //     return 'utility:' + this.type;
    // }

    // get innerClass() {
    //     return 'slds-icon_container slds-icon-utility-' + this.type + ' slds-m-right_small slds-no-flex slds-align-top';
    // }

    // get outerClass() {
    //     return 'slds-notify slds-notify_toast slds-theme_' + this.type;
    // }

    // custom toast event

    revertConfig() {
        this.template.querySelector('.switchConfig').style.display = 'none';
        if (this.customerEmail == null || this.customerEmail == "" || this.customerEmail == undefined) {
            this.displayEmailPopUp();
        }
        else {
            this.serviceVisible = true;
        }
    }

    saveConfig() {
        getLabels({ language: this.suggestedTextLanguage }).then(result => {
            this.label = [];
            result.forEach(element => {
                this.label[element.Name] = element[this.textLanguage + '__c'];

                if (this.customerType == 'bookNow') {
                    this.bodyText = this.label.bookYourCarWashAtHomeOrAt;
                }
                else {
                    if (this.customerType == 'requestQuote') {
                        this.bodyText = this.label.Book_your_car_wash_at_your_site_or;
                    }
                }

                this.EnterYourStreet = this.label.Enter_your_street;
                this.ourPartnerCarParks = this.label.our_partner_car_parks;
                if (this.serviceVisible == true) {
                    this.template.querySelector('c-choose-your-service').setChooseYourServiceValue(this.label.serviceChoose);
                }
                this.paymenthMethodChoosenValues = [
                    { label: this.label.OneTime, value: 'One Time' },
                    { label: this.label.Subscription, value: 'Subscription' }
                ];
                this.subscriptionMonthsOptions = [
                    { label: '6 ' + this.label.months, value: '6' },
                    { label: '12 ' + this.label.months, value: '12' }
                ];

                this.months = [this.label.January, this.label.February, this.label.March, this.label.April, this.label.May, this.label.June, this.label.July, this.label.August, this.label.September, this.label.October, this.label.November, this.label.December];
            });
        }).catch(error => {
        })

        this.template.querySelector('.languages').value = this.suggestedConfigrationLanguage;
        this.selectedCurrency = this.suggestedConfigrationLanguage.split(',')[1];
        this.vfPage.updateURLParameter(this.suggestedConfigrationLanguage.split(',')[0]);
        this.template.querySelector('.switchConfig').style.display = 'none';
        if (this.customerEmail == null || this.customerEmail == "" || this.customerEmail == undefined) {
            this.displayEmailPopUp();
        }
        else {
            this.serviceVisible = true;
        }
    }

    @track addressForService;
    @track selectedConfigration;
    @track suggestedConfigration;
    @track suggestedConfigrationLanguage;
    @track suggestedTextLanguage;

    checkLocationandCurrency() {

        if (this.currentAddress != undefined) {
            console.log('this.template.querySelector(\'.languages\').value : ' + this.template.querySelector('.languages').value);
            let configs = {
                'en_US,CHF': 'English (CHF)',
                'fr_CH,CHF': 'French (CHF)',
                'de_CH,CHF': 'German (CHF)',
                'fr_CH,EUR': 'French (EUR)'
            }
            switch (this.currentAddress.split(',')[this.currentAddress.split(',').length - 1].trim()) {
                case 'Switzerland':
                    // this.selectedCurrency = 'CHF';
                    if (this.selectedCurrency != 'CHF') {
                        this.addressForService = 'Switzerland';
                        this.selectedConfigration = configs[this.template.querySelector('.languages').value];
                        for (let key in configs) {
                            console.log()
                            if (configs[key] === 'French (CHF)') {
                                this.suggestedConfigration = 'French (CHF)';
                                this.suggestedConfigrationLanguage = key;
                            }
                        }
                        this.suggestedTextLanguage = 'French';
                        this.template.querySelector('.switchConfig').style.display = 'block';
                    }
                    else {
                        this.revertConfig();
                    }
                    break;
                default:
                    this.selectedCurrency = this.template.querySelector('.languages').value.split(',')[1];
                    this.revertConfig();
            }
            console.log(this.selectedCurrency);
        }
    }

    setMapMarker(event) {
        this.currentAddress = event.detail[3];
        // // console.log('Current Address on setMapMarker : ' + this.currentAddress);
        let message = JSON.stringify({
            eventType: 'setMarker',
            data: event.detail[0] + ',' + event.detail[1].slice(1),
            zoomLevel: 18,
            windowUrl: this.currentURL
        });


        const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
        this.dispatchEvent(customEventVar1);



        //Checking Location & Currency
        this.checkLocationandCurrency();


        // if (this.customerEmail == null || this.customerEmail == "" || this.customerEmail == undefined) {
        //     this.checkLocationandCurrency();
        // }
        // else {
        //     this.serviceVisible = true;

        // }
        this.searchPlaceLatitude = event.detail[0];
        this.searchPlaceLongitude = event.detail[1].slice(1);
        this.country = event.detail[2];
    }
    currentAddress;
    PartnerCarParksAddress;
    setRoute(event) {
        this.currentAddress = event.detail[2];
        // // console.log('Current Address on setRoute : ' + this.currentAddress);
        // // console.log('This.currentAddress : ' + this.currentAddress)
        let message = JSON.stringify({
            eventType: 'getRoute',
            partnerLocation: event.detail[0] + ',' + event.detail[1],
            customerLocation: this.searchPlaceLatitude + ',' + this.searchPlaceLongitude,
            zoomLevel: 18,
            windowUrl: this.currentURL
        });
        const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
        this.dispatchEvent(customEventVar1);
        this.template.querySelector('c-choose-your-service').hideOrShowComponent('hide');

    }

    hideServiceComponent() {
        // // console.log('event Catcheddd');
        this.template.querySelector('c-choose-your-service').hideOrShowComponent('hideb2b');
    }

    restoreServiceComponent() {
        this.template.querySelector('c-choose-your-service').hideOrShowComponent('show');
    }

    initializeMarker() {
        let message = JSON.stringify({
            eventType: 'setMarker',
            data: this.searchPlaceLatitude + ',' + this.searchPlaceLongitude,
            zoomLevel: 18,
            windowUrl: this.currentURL
        });

        const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
        this.dispatchEvent(customEventVar1);

    }

    paymentMethodChanged(event) {
        if (event.target.value == 'Subscription') {
            this.template.querySelector('.subscriptionMonths').style.display = 'block';
        }
        else {
            this.template.querySelector('.subscriptionMonths').style.display = 'none';
        }
    }

    showSelectYourZawash(event) {
        this.checkLocationandCurrency();
        // if (this.customerEmail == null || this.customerEmail == "" || this.customerEmail == undefined) {
        //     this.checkLocationandCurrency();
        // }
        // else {
        //     this.serviceVisible = true;

        // }
    }

    saveCustomerEmail() {
        //// // console.log('Hi start' );
        let paymentMethod = this.template.querySelector('.EmailPopUpCombobox').value;
        let emailEnterd = this.template.querySelector('.emailInput').value;
        this.mobileNoEntered = this.template.querySelector('.mobileNo').value;
        // // // console.log('mobileNoEntered : ' + this.mobileNoEntered);
        //// // console.log('got input',paymentMethod, emailEnterd , this.mobileNoEntered);
        if (paymentMethod == '' || paymentMethod == null || paymentMethod == undefined || emailEnterd == '' || emailEnterd == null || emailEnterd == undefined) {
            this.template.querySelector('.errorMsg').innerHTML = this.label.Please_fill_all_the_details;
            this.template.querySelector('.error').style.display = 'block';
        }
        else {
            if (this.template.querySelector('.subscriptionMonths').style.display == 'block') {
                //// // console.log('in if');
                if (this.template.querySelector('.subscriptionMonths').value == "" || this.template.querySelector('.subscriptionMonths').value == null || this.template.querySelector('.subscriptionMonths').value == undefined || this.template.querySelector('.subscriptionMonths').value == NaN) {
                    this.template.querySelector('.errorMsg').innerHTML = this.label.Please_fill_all_the_details;
                    this.template.querySelector('.error').style.display = 'block';
                }
                else {
                    if (this.template.querySelector('.noOfCarsInput').style.display == 'block') {
                        if (this.template.querySelector('.noOfCarsInput').value == "" || this.template.querySelector('.noOfCarsInput').value == null || this.template.querySelector('.noOfCarsInput').value == undefined || this.template.querySelector('.noOfCarsInput').value == NaN) {
                            this.template.querySelector('.errorMsg').innerHTML = this.label.Please_fill_all_the_details;
                            this.template.querySelector('.error').style.display = 'block';
                        }
                        else {
                            let numbers = /^\d+$/;
                            if (this.template.querySelector('.noOfCarsInput').value.match(numbers)) {
                                if (parseInt(this.template.querySelector('.noOfCarsInput').value) < 3) {
                                    this.template.querySelector('.errorMsg').innerHTML = this.label.number_of_cars_shuld_be_atleast_3;
                                    this.template.querySelector('.error').style.display = 'block';
                                }
                                else {
                                    var mailformat = /^[a-zA-Z0-9'*+._]+@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
                                    // var mailformat=/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

                                    let customerEmail = this.template.querySelector('.emailInput').value;
                                    if (customerEmail.match(mailformat)) {
                                        this.template.querySelector('.save').style.display = 'none';
                                        this.template.querySelector('.loader').style.display = 'block';
                                        let customer;
                                        if (this.customerType == 'requestQuote') {
                                            customer = 'b2b';
                                        }
                                        // // console.log('Lead Data : ', customerEmail + ' , ' + customer + ' , ' + this.mobileNoEntered);
                                        createLead({ mail: customerEmail, customerType: customer, phoneNumber: this.selectedCountryCode + ' ' + this.mobileNoEntered }).then(result => {
                                            this.leadId = result;
                                            if (this.template.querySelector('.noOfCarsInput').style.display == 'block') {
                                                this.numbersOfCars = this.template.querySelector('.noOfCarsInput').value;
                                            }
                                            this.customerEmail = this.template.querySelector('.emailInput').value;
                                            this.template.querySelector('.customerEmail').innerHTML = this.template.querySelector('.emailInput').value;
                                            this.subscriptionMonths = this.template.querySelector('.subscriptionMonths').value;
                                            console.log('this.subscriptionMonths : ', this.subscriptionMonths);
                                            this.template.querySelector('.emailPopUp').style.display = 'none';
                                            this.paymenthMethodChoosen = this.template.querySelector('.EmailPopUpCombobox').value;
                                            this.serviceVisible = true;
                                        }).catch(error => {
                                        })
                                    }
                                    else {
                                        this.template.querySelector('.errorMsg').innerHTML = this.label.Please_Enter_a_valid_Email_address;
                                        this.template.querySelector('.error').style.display = 'block';
                                    }
                                }
                            }
                            else {
                                this.template.querySelector('.errorMsg').innerHTML = this.label.Please_enter_a_valid_number_of_cars;
                                this.template.querySelector('.error').style.display = 'block';
                            }

                        }
                    }
                    else {
                        var mailformat = /^[a-zA-Z0-9'*+._]+@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
                        let customerEmail = this.template.querySelector('.emailInput').value;
                        if (customerEmail.match(mailformat)) {
                            this.template.querySelector('.save').style.display = 'none';
                            this.template.querySelector('.loader').style.display = 'block';
                            let customer;
                            if (this.customerType == 'requestQuote') {
                                customer = 'b2b';
                            }
                            // // console.log('Lead Data : ', customerEmail + ' , ' + customer + ' , ' + this.mobileNoEntered);
                            createLead({ mail: customerEmail, customerType: customer, phoneNumber: this.selectedCountryCode + ' ' + this.mobileNoEntered }).then(result => {
                                this.leadId = result;
                                //// // console.log('lead',this.leadId);
                                if (this.template.querySelector('.noOfCarsInput').style.display == 'block') {
                                    this.numbersOfCars = this.template.querySelector('.noOfCarsInput').value;
                                }
                                this.customerEmail = this.template.querySelector('.emailInput').value;
                                this.template.querySelector('.customerEmail').innerHTML = this.template.querySelector('.emailInput').value;
                                this.subscriptionMonths = this.template.querySelector('.subscriptionMonths').value;
                                console.log('this.subscriptionMonths : ', this.subscriptionMonths);
                                this.template.querySelector('.emailPopUp').style.display = 'none';
                                //// // console.log();
                                this.paymenthMethodChoosen = this.template.querySelector('.EmailPopUpCombobox').value;
                                //// // console.log(this.paymenthMethodChoosen, this.customerType, this.currentLanguage, this.selectedCurrency +' AKF K ', 1);

                                this.serviceVisible = true;
                            }).catch(error => {
                                //threw err - puneet
                                throw error;
                                //// // console.log(error);
                            })
                        }
                        else {
                            this.template.querySelector('.errorMsg').innerHTML = this.label.Please_Enter_a_valid_Email_address;
                            this.template.querySelector('.error').style.display = 'block';
                        }
                    }
                }
            }
            else {
                //// // console.log('in else');
                if (this.template.querySelector('.noOfCarsInput').style.display == 'block') {
                    if (this.template.querySelector('.noOfCarsInput').value == "" || this.template.querySelector('.noOfCarsInput').value == null || this.template.querySelector('.noOfCarsInput').value == undefined || this.template.querySelector('.noOfCarsInput').value == NaN) {
                        this.template.querySelector('.errorMsg').innerHTML = this.label.Please_fill_all_the_details;
                        this.template.querySelector('.error').style.display = 'block';
                    }
                    else {
                        let numbers = /^\d+$/;
                        if (this.template.querySelector('.noOfCarsInput').value.match(numbers)) {
                            if (parseInt(this.template.querySelector('.noOfCarsInput').value) < 3) {
                                this.template.querySelector('.errorMsg').innerHTML = this.label.number_of_cars_shuld_be_atleast_3;
                                this.template.querySelector('.error').style.display = 'block';
                            }
                            else {
                                var mailformat = /^[a-zA-Z0-9'*+._]+@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
                                let customerEmail = this.template.querySelector('.emailInput').value;
                                if (customerEmail.match(mailformat)) {
                                    this.template.querySelector('.save').style.display = 'none';
                                    this.template.querySelector('.loader').style.display = 'block';
                                    let customer;
                                    if (this.customerType == 'requestQuote') {
                                        customer = 'b2b';
                                    }
                                    // // console.log('Lead Data : ', customerEmail + ' , ' + customer + ' , ' + this.mobileNoEntered);
                                    createLead({ mail: customerEmail, customerType: customer, phoneNumber: this.selectedCountryCode + ' ' + this.mobileNoEntered }).then(result => {
                                        this.leadId = result;
                                        //// // console.log(this.leadId);
                                        if (this.template.querySelector('.noOfCarsInput').style.display == 'block') {
                                            this.numbersOfCars = this.template.querySelector('.noOfCarsInput').value;
                                        }
                                        this.customerEmail = this.template.querySelector('.emailInput').value;
                                        this.template.querySelector('.customerEmail').innerHTML = this.template.querySelector('.emailInput').value;
                                        this.template.querySelector('.emailPopUp').style.display = 'none';
                                        this.paymenthMethodChoosen = this.template.querySelector('.EmailPopUpCombobox').value;
                                        //// // console.log(this.paymenthMethodChoosen, this.customerType, this.currentLanguage, this.selectedCurrency +' AKF K ', 2);

                                        this.serviceVisible = true;
                                    }).catch(error => {
                                        //threw err - puneet
                                        throw error;
                                        //// // console.log(error);
                                    })
                                }
                                else {
                                    this.template.querySelector('.errorMsg').innerHTML = this.label.Please_Enter_a_valid_Email_address;
                                    this.template.querySelector('.error').style.display = 'block';
                                }
                            }
                        }
                        else {
                            this.template.querySelector('.errorMsg').innerHTML = this.label.Please_enter_a_valid_number_of_cars;
                            this.template.querySelector('.error').style.display = 'block';
                        }

                    }
                }
                else {
                    var mailformat = /^[a-zA-Z0-9'*+._]+@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
                    let customerEmail = this.template.querySelector('.emailInput').value;
                    if (customerEmail.match(mailformat)) {
                        this.template.querySelector('.save').style.display = 'none';
                        this.template.querySelector('.loader').style.display = 'block';
                        let customer;
                        if (this.customerType == 'requestQuote') {
                            customer = 'b2b';
                        }
                        // // console.log('Lead Data : ', customerEmail + ' , ' + customer + ' , ' + this.mobileNoEntered);
                        createLead({ mail: customerEmail, customerType: customer, phoneNumber: this.selectedCountryCode + ' ' + this.mobileNoEntered }).then(result => {
                            this.leadId = result;
                            //// // console.log(this.leadId); 
                            if (this.template.querySelector('.noOfCarsInput').style.display == 'block') {
                                this.numbersOfCars = this.template.querySelector('.noOfCarsInput').value;
                            }
                            this.customerEmail = this.template.querySelector('.emailInput').value;
                            this.template.querySelector('.customerEmail').innerHTML = this.template.querySelector('.emailInput').value;
                            this.template.querySelector('.emailPopUp').style.display = 'none';
                            this.paymenthMethodChoosen = this.template.querySelector('.EmailPopUpCombobox').value;
                            //// // console.log(this.paymenthMethodChoosen, this.customerType, this.currentLanguage, this.selectedCurrency +' AKF K ', 3);

                            this.serviceVisible = true;
                            //// // console.log('post servicevisible true 3');
                        }).catch(error => {
                            //threw err - puneet
                            throw error;
                            //// // console.log(error);
                        })
                    }
                    else {
                        this.template.querySelector('.errorMsg').innerHTML = this.label.Please_Enter_a_valid_Email_address;
                        this.template.querySelector('.error').style.display = 'block';
                    }
                }
            }
        }

    }

    // makeServiceVisible(event) {
    //     if (this.customerEmail == null || this.customerEmail == "" || this.customerEmail == undefined) {
    //         this.checkLocationandCurrency();
    //     }
    //     else {
    //         this.serviceVisible = true;
    //         this.zoomLevel = 17;
    //         this.template.querySelector('c-zawash-front-ui').reduceComponentWidth();
    //         this.template.querySelector('c-select-your-zawash').setzawashComponentWidth();
    //     }
    //     this.paymenthMethodChoosen = event.detail[1];
    // }


    hideEmailError(event) {
        if (!event.target.classList.contains('save')) {
            this.template.querySelector('.error').style.display = 'none';
        }
    }

    hideEveryThing() {
        this.serviceVisible = false;
        this.serviceCart = false;
        this.appointmentBookingVisibility = false;
        this.paymentSectionVisibility = false;
        this.serviceSpotVisibility = false;
        this.subscriptionCardVisibility = false;
        this.bankPaymentVisibility = false;
        this.cardPaymentVisibility = false;
        this.selectCustomerType = false;
        this.paymentSuccessfullPageVisibility = false;
        this.zoomLevel = 18;
        this.template.querySelector('c-choose-your-service').resetBorder();
        this.template.querySelector('.shadowOverlay').style.display = 'none';
        this.template.querySelector('c-zawash-front-ui').resetComponentWidth();
        let message = JSON.stringify({
            eventType: 'reduceZoomLevel',
            zoomLevel: 20,
        });
        const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
        this.dispatchEvent(customEventVar1);

    }

    showServiceCart(event) {
        this.serviceChoosen = event.detail[1];
        this.servicePrice = event.detail[2];
        this.subTotalMiniComponentCost = event.detail[2];
        this.serviceEstimatedDuration = event.detail[3];
        this.serviceIcon = event.detail[4];
        this.serviceChoosenId = event.detail[5];
        this.serviceDescription = event.detail[6];
        this.currentCurrency = event.detail[7];

        if (this.customerType == 'requestQuote') {
            console.log('this.serviceChoosen : ' + this.serviceChoosen);
            if (this.serviceChoosen == 'Customize' || this.serviceChoosen == 'Anpassen' || this.serviceChoosen == 'Personnaliser' || this.serviceChoosen == 'Personalisierter Service') {
                this.template.querySelector('c-choose-your-service').showLoader(); 4
                console.log('customerType 111 : ' + this.customerType);
                console.log('Currency : ' + this.selectedCurrency);
                createWorkOrder({ leadId: this.leadId, serviceId: this.serviceChoosenId, paymentMode: this.paymenthMethodChoosen, numOfCars: this.numbersOfCars, customerType: this.customerType, selectedCurrency: this.selectedCurrency , Travel : true }).then(result => {
                    // // // console.log('createWorkOrder : ' + result);
                    this.workOrderId = result;
                    this.template.querySelector('c-choose-your-service').hideLoader();
                    this.template.querySelector('c-zawash-front-ui').reduceComponentWidth();
                    this.template.querySelector('c-choose-your-service').setzawashComponentWidth();

                    this.serviceCart = true;

                    this.template.querySelector('.shadowOverlay').style.display = 'block';
                }).catch(error => {
                })
            }
            else {
                this.totalTimeTakenInService = 60;
                this.template.querySelector('c-choose-your-service').showLoader();
                console.log('customerType 111 : ' + this.customerType);
                console.log('Currency : ' + this.selectedCurrency);
                createWorkOrder({ leadId: this.leadId, serviceId: this.serviceChoosenId, paymentMode: this.paymenthMethodChoosen, numOfCars: this.numbersOfCars, customerType: this.customerType, selectedCurrency: this.selectedCurrency , Travel : true}).then(result => {
                    // // // console.log('createWorkOrder : ' + result);
                    this.workOrderId = result;
                    this.template.querySelector('c-choose-your-service').hideLoader();
                    this.template.querySelector('c-zawash-front-ui').reduceComponentWidth();
                    this.template.querySelector('c-choose-your-service').setzawashComponentWidth();

                    let message = JSON.stringify({
                        eventType: 'setCenter',
                        data: this.searchPlaceLatitude + ',' + this.searchPlaceLongitude,
                        windowUrl: this.currentURL
                    });
                    const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
                    this.dispatchEvent(customEventVar1);

                    this.appointmentBookingVisibility = true;
                    this.template.querySelector('.shadowOverlay').style.display = 'block';
                }).catch(error => {
                })
            }
        }
        else {
            if (this.customerType == 'bookNow') {
                this.template.querySelector('.shadowOverlay').style.display = 'block';
                if (this.paymenthMethodChoosen == 'Subscription') {
                    this.template.querySelector('c-zawash-front-ui').reduceComponentWidth();
                    this.template.querySelector('c-choose-your-service').setzawashComponentWidth();

                    let message = JSON.stringify({
                        eventType: 'setCenter',
                        data: this.searchPlaceLatitude + ',' + this.searchPlaceLongitude,
                        windowUrl: this.currentURL
                    });
                    const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
                    this.dispatchEvent(customEventVar1);


                    this.totalTimeTakenInService = this.serviceEstimatedDuration;



                    this.serviceSpotVisibility = event.detail[0];
                }
                else {
                    if (this.paymenthMethodChoosen == 'One Time') {
                        this.template.querySelector('c-zawash-front-ui').reduceComponentWidth();
                        this.template.querySelector('c-choose-your-service').setzawashComponentWidth();

                        let message = JSON.stringify({
                            eventType: 'setCenter',
                            data: this.searchPlaceLatitude + ',' + this.searchPlaceLongitude,
                            windowUrl: this.currentURL
                        });
                        const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
                        this.dispatchEvent(customEventVar1);



                        this.serviceCart = event.detail[0];
                    }
                }
            }
        }
    }

    hideServiceChoose(event) {
        this.template.querySelector('c-choose-your-service').resetBorder();
        this.template.querySelector('.shadowOverlay').style.display = 'none';
        this.template.querySelector('c-choose-your-service').resetComponentWidth();
        this.template.querySelector('c-zawash-front-ui').resetComponentWidth();
        let message = JSON.stringify({
            eventType: 'setCenter',
            data: this.searchPlaceLatitude + ',' + this.searchPlaceLongitude,
            windowUrl: this.currentURL
        });
        const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
        this.dispatchEvent(customEventVar1);
    }

    serviceCartControll(event) {
        this.serviceCart = event.detail;
        this.hideServiceChoose();
    }

    travel;
    totalTimeTakenInService;

    hideCartAndShowSubtotalComponent(event) {
        if (this.customerType == 'requestQuote') {
            this.appointmentBookingVisibility = event.detail[0];
            this.subTotalMiniComponentCost = event.detail[1];
            this.currentCurrency = event.detail[2];
            this.listOfAddons = event.detail[3];
            this.totalTimeTakenInService = event.detail[5];
            setTimeout(() => { this.serviceCart = false; }, 1000);
        }
        else {
            if (this.customerType == 'bookNow') {
                this.serviceSpotVisibility = event.detail[0];
                this.subTotalMiniComponentCost = event.detail[1];
                this.currentCurrency = event.detail[2];
                this.listOfAddons = event.detail[3];
                this.travel = event.detail[4];
                this.totalTimeTakenInService = event.detail[5];
                setTimeout(() => { this.serviceCart = false; }, 1000);
            }
        }
    }
    hideServiceSpot(event) {
        this.serviceSpotVisibility = event.detail[0];
        this.hideServiceChoose();
        this.restoreServiceComponent();
    }

    proceedToAppointmentBooking(event) {
        this.appointmentBookingVisibility = true;
        this.workOrderId = event.detail[1];
        this.currentAddress = event.detail[2];
        // // // console.log('This.currentAddress : ' + this.currentAddress)
        // this.restoreServiceComponent();
        this.template.querySelector('c-choose-your-service').hideOrShowComponent('hide');
    }
    hideAppointmentBooking(event) {
        this.appointmentBookingVisibility = event.detail;
        if (this.customerType == 'requestQuote') {
            this.template.querySelector('c-choose-your-service').resetBorder();
            this.template.querySelector('.shadowOverlay').style.display = 'none';
            this.template.querySelector('c-choose-your-service').resetComponentWidth();
            this.template.querySelector('c-zawash-front-ui').resetComponentWidth();
            let message = JSON.stringify({
                eventType: 'setCenter',
                data: this.searchPlaceLatitude + ',' + this.searchPlaceLongitude,
                windowUrl: this.currentURL
            });
            const customEventVar1 = new CustomEvent('messagerfromlwc', { detail: [message], bubbles: true, composed: true });
            this.dispatchEvent(customEventVar1);
            this.template.querySelector('c-choose-your-service').hideOrShowComponent('showb2b');
        }
    }

    //
    @api serviceAppointmentId;
    showPaymentSection(event) {
        if (this.customerType == 'requestQuote') {
            this.dateSelected = event.detail[1];
            this.startTime = event.detail[2];
            this.endTime = event.detail[3];
            this.subTotalMiniComponentCost = event.detail[4];
            this.cardPaymentVisibility = true;
        }
        else {
            if (this.customerType == 'bookNow') {
                this.dateSelected = event.detail[1];
                this.startTime = event.detail[2];
                this.endTime = event.detail[3];
                this.leadId = event.detail[4];
                this.subTotalMiniComponentCost = event.detail[5];
                this.serviceAppointmentId = event.detail[6];
                this.cardPaymentVisibility = true;
            }
        }
    }


    hideCardPayment(event) {
        this.cardPaymentVisibility = event.detail;
    }
    hideBankPayment(event) {
        this.bankPaymentVisibility = event.detail;
    }


    @track finalServiceAppointmentId;
    paymentSuccessfull(event) {
        console.log('OUTPUT : event found catched payment ');
        // this.serviceResourceJSON = this.template.querySelector('c-card-payment').serviceResourceJSON;
        this.serviceResourceJSON = event.detail[1];
        this.finalServiceAppointmentId = event.detail[0];
        this.paymentSuccessfullPageVisibility = true;
        console.log('Resource', this.serviceResourceJSON, 'ServiceAppointmentId', this.finalServiceAppointmentId, 'PaymentSuccess', this.paymentSuccessfullPageVisibility);
        setTimeout(() => {
            this.template.querySelector('c-payment-successful-page').setserviceResourceJSON(this.serviceResourceJSON, this.finalServiceAppointmentId);
        }, 0);
    }

    showCase = false;
    handleShowCase() {
        this.showCase = true;
    }
    handleHideCase() {
        this.showCase = false;
    }
    handleSubmitCase() {
        var userName = this.template.querySelector('.username').value;
        var userEmail = this.template.querySelector('.useremail').value;
        var userSubject = this.template.querySelector('.usersubject').value;


        if (userName == "" || userEmail == "" || userSubject == undefined) {
            this.template.querySelector('.contactUsErrorMsg').innerHTML = this.label.Please_fill_all_the_details;
            this.template.querySelector('.contactUsError').style.display = 'block';
            setTimeout(() => {
                this.template.querySelector('.contactUsError').style.display = 'none';
            }, 4000)
        }
        else {
            var mailformat = /^[a-zA-Z0-9'*+._]+@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
            if (userEmail.match(mailformat)) {
                this.template.querySelectorAll('.contactUscontolls').forEach(element => {
                    element.style.display = 'none';
                });
                this.template.querySelector('.contactUsLoader').style.display = 'block';
                createCase({ name: userName, Email: userEmail, Subject: userSubject })
                    .then(result => {
                        this.template.querySelector('.contactUsLoader').style.display = 'block';
                        const event = new ShowToastEvent({
                            title: this.label.Success_Your_Enquiry_has_been_,
                            variant: 'Success'
                        });
                        this.dispatchEvent(event);
                        this.showCase = false;
                    }).catch(err => {
                    })
            }
            else {
                this.template.querySelector('.contactUsErrorMsg').innerHTML = this.label.Please_Enter_a_valid_Email_address;
                this.template.querySelector('.contactUsError').style.display = 'block';
                setTimeout(() => {
                    this.template.querySelector('.contactUsError').style.display = 'none';
                }, 3000)
            }
        }
    }


    updateLeadId(event) {
        this.leadId = event.detail;
    }

    setlanguage = 'en_US';

    navigateToWebPage() {
        // // // console.log('test');
        //// // console.log('called navigation',window.location.href);
        //// // console.log('called navigation parent',parent.window.location.href);
        var language = this.template.querySelector('.languages').value
        var setlanguage = 'en_US';
        if (language == 'en_US,CHF') {
            setlanguage = 'en_US';
        }
        else if (language == 'fr_CH,CHF' || language == 'fr_CH,EUR') {
            setlanguage = 'fr';
        } else {
            setlanguage = 'de_CH';

        }

        //// // console.log('setlanguage===>>>',setlanguage);
        //let baseURLis = 'https://zawash.my.site.com/zaWash/s/login/'
        // let urlToLocate = baseURLis+'?language=${setlanguage}';
        //// // console.log('urlToLocate===>>',urlToLocate);
        //    window.location.replace(urlToLocate,"_self");
        // window.location.replace(urlToLocate);
        // // // console.log('test 0123 LWC ');
        this.setlanguage = setlanguage;
        this.vfPage.passCustomerType(this.setlanguage);
        //  // // console.log('called navigation',parent.window.location.href);
    }

    // handleLogOut() {
    //     parent.window.location.replace("https://zawash--sandbox.sandbox.my.site.com/zaWash/secur/logout.jsp", "_self");
    // }
    // redirectToDashboard()
    // {
    //     parent.window.location.replace(`https://zawash--sandbox.sandbox.my.site.com/zaWash/s/customer-booking?accId=${this.accountId}`);
    // }
}