import { LightningElement, api, track } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import submitForm from '@salesforce/apex/getSlots.submitForm';
import sendTime from '@salesforce/apex/getSlots.sendTime';
import updateServiceAppointmentTotalPrice from '@salesforce/apex/getSlots.updateServiceAppointmentTotalPrice';
import getTimeSlots from '@salesforce/apex/getSlots.getTimeSlots';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
import getQuotes from '@salesforce/apex/zawashHelperClass.getQuotes';
import ratingStars from '@salesforce/resourceUrl/ratingStars';
import getServiceResource from '@salesforce/apex/zawashHelperClass.getServiceResource';


export default class AddBooking extends LightningElement {

    leftAngle = icons + '/ZawashIcons/leftAngle.webp';
    rightAngle = icons + '/ZawashIcons/rightAngle.png';
    washerIcon = icons + '/ZawashIcons/washer.png';
    QuoteOptions;
    existingQuoteOptions;
    quotes;
    showCalender = false;
    selectedQuote = {};
    booking = true;
    @track assignedResource;
    rating;
    @api accountId;
    @track resourceNotFound = false;

    @track label = {
        appointmentBooking: "",
        appointmentBookingProceed: "",
        pleaseFillTheFollowingDetails: "",
        Submit: "",
        Car: "",
        Details: "",
        Car_brand_model: "",
        Color_Plate_number: "",
        Car_year: "", Error: "", mobileNo: ""
    }

    @api textLanguage;

    @track existingQuoteOptionsRecords = [];

    connectedCallback() {
        getQuotes({ accId: this.accountId }).then(quote => {

            console.log('quotes', JSON.stringify(quote));
            this.quotes = quote;
            let item = [];
            this.existingQuoteOptionsRecords = [];

            quote.forEach(element => {
                console.log(element.zaWash_Quotes__r);
                if(element.ServiceAppointments && element?.zaWash_Quotes__r)
                {
                    if(element.ServiceAppointments.length < element.zaWash_Quotes__r[0].Number_of_Cars__c)
                    {
                        item.push({ label: element.zaWash_Quotes__r[0].Name, value: element.Id });
                        this.existingQuoteOptionsRecords.push({ Id: element.Id, Address: element.Street, price: element.zaWash_Quotes__r[0].Total_Price__c });
                    }
                }else
                {
                    if(element?.zaWash_Quotes__r)
                    {
                        item.push({ label: element.zaWash_Quotes__r[0].Name, value: element.Id });
                        this.existingQuoteOptionsRecords.push({ Id: element.Id, Address: element.Street, price: element.zaWash_Quotes__r[0].Total_Price__c });
                    }
                }
            });
            console.log('quotes', item);

            this.existingQuoteOptions = item;
        }).catch(error => {
            console.log(error);
        })

        getLabels({ language: this.textLanguage }).then(result => {

            result.forEach(element => {
                this.label[element.Name] = element[this.textLanguage + '__c'];
            });

            this.months = [this.label.January, this.label.February, this.label.March, this.label.April, this.label.May, this.label.June, this.label.July, this.label.August, this.label.September, this.label.October, this.label.November, this.label.December];
        }).catch(error => {

        })

        let today = new Date();
        let year = today.getFullYear();

        if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
            this.daysInMonths[1] = 29;
        } else {
            this.daysInMonths[1] = 28;
        }

        this.setOptionsForCountryCode();
    }

    callgetappointments() {
        let ev = new CustomEvent('addedbooking');
        this.dispatchEvent(ev);
    }

    getSelectedQuoteData(event) {

        this.template.querySelector('[data-id="addons"]').style.display = 'none';

        let element;
        this.quotes.forEach(quote => {
            if (quote.Id == event.detail.value) {
                element = quote;
            }
        })
        this.workOrderId = element.Id;
        let status=false;

        let addOnArray = [];

        if (element.CustomerOrders__r != undefined) {
            element.CustomerOrders__r.forEach(element => {
                if(element.Name!='Travel'){
                addOnArray.push({ name: element.Name, quantity: element.Quantity__c, price: element.Price__c });
                status=false;
                }else{
                    status=true;
                }
            });
                if(status==false){
            this.template.querySelector('[data-id="addons"]').style.display = 'flex';
                }
        }
        this.woId = element.Id;
        const date = new Date(element.CreatedDate);
const day = date.getDate().toString().padStart(2, '0');
const month = (date.getMonth() + 1).toString().padStart(2, '0');
const year = date.getFullYear();
const formattedDate = `${day}.${month}.${year}`;
console.log(formattedDate);
        this.selectedQuote = {
            Id: element.Id,
            customerName: element.Account.Name,
            date: formattedDate,
            serviceType: element.WorkType.Name,
            totalPrice: element.totalPrice__c,
            price: element.WorkType.Price__c,
            currency: element.WorkType.Currency__c,
            addons: addOnArray,
            icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
        };


        this.template.querySelector('.selectedQuotesDetail').style.display = 'block';

        this.showCalender = true;


    }

    months;

    daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    timeSlots = [];
    loader = false;
    dateSelected;
    selectedTimeSlot;
    customerType = 'requestQuote';
    AccountId;
    carDetailsVisibility = false;

    countryCodeOptions;
    selectedCountryCode;
    mobileNoEntered = '';
    showEmailInputField = false;

    showEmailField(event) {
        console.debug(event.target.checked);
        this.showEmailInputField = !event.target.checked;
    }

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
            item.push({ label: element, value: element });
        });

        this.countryCodeOptions = item;

        if (this.textLanguage == 'English') {
            this.selectedCountryCode = 'France(+33)';
        }
        else if (this.textLanguage == 'French') {
            this.selectedCountryCode = 'France(+33)';
        }
        else if (this.textLanguage == 'German') {
            this.selectedCountryCode = 'Germany(+49)';
        }


    }

    appendMobileNo(event) {

        const keyCode = event.keyCode;
        console.debug(keyCode);
        console.debug(event.target.value);

        const excludedKeys = [37, 39, 46, 16, 20, 32];

        if (((keyCode >= 65 && keyCode <= 90) || (excludedKeys.includes(keyCode)))) {
            event.preventDefault();
        }
        else {
            this.mobileNoEntered = event.target.value;
            this.template.querySelector('.mobileNo').value = this.mobileNoEntered;
        }

    }

    serviceAppointmentId;

    handleCountryCodeChange(event) {
        this.selectedCountryCode = event.detail.value;
    }

    selectDate(event) {
        if (!(event.target.classList.contains('disabled'))) {
            this.carDetailsVisibility = false;
            this.template.querySelector('.goToPayment').style.display = 'none';
            this.template.querySelector('.noTimeSlots').style.display = 'none';
            this.template.querySelectorAll('.slot').forEach(element => {
                element.style.background = 'white';
                element.style.color = 'black';
            });
            this.template.querySelector('.noTimeSlots').style.display = 'none';
            this.template.querySelector('.loader').style.display = 'block';
            this.template.querySelector('.timeSlots').style.display = 'none';

            if (!(event.target.classList.contains('disabled'))) {
                this.template.querySelectorAll('.calender-day').forEach(element => {
                    element.classList.remove('active');
                })
                event.target.classList.add('active');
            }
            if (!(event.target.classList.contains('disabled'))) {
                let selectedDate = new Date();
                selectedDate.setFullYear(parseInt(this.template.querySelector('.year').innerHTML));
                selectedDate.setMonth(parseInt(this.months.indexOf(this.template.querySelector('.month').innerHTML)));
                selectedDate.setDate(parseInt(event.target.innerHTML));
                let workOrderAddress = this.existingQuoteOptionsRecords.filter((element) => {
                    if (element.Id == this.workOrderId) {
                        return element.Address
                    };
                });


                let todaysDate = new Date();
                console.log('todaysDate : ' + todaysDate);
                console.log('selectedDate : ' + selectedDate);
                if (selectedDate <= todaysDate||selectedDate.getDay() % 7 === 0) {
                    console.log('Old Date');
                    this.template.querySelector('.noTimeSlots').style.display = 'block';
                    this.template.querySelector('.loader').style.display = 'none';
                }
                else {


                    getTimeSlots({ SelectedDate: selectedDate, workOrderId: this.workOrderId, cusType: this.customerType, Address: workOrderAddress[0].Address, Duration: 45 }).then(result => {
                        console.debug(result);

                        if (result == null || result == "" || result == undefined) {
                            this.template.querySelector('.noTimeSlots').style.display = 'block';
                            this.template.querySelector('.loader').style.display = 'none';
                        }
                        else {
                            let slots = [];
                            let resultLength = result.length;
                            let count = 1;


                            result.forEach(element => {

                                if (count == resultLength) {
                                    this.serviceAppointmentId = element;
                                    console.debug(this.serviceAppointmentId);
                                }
                                else {
                                    let elementSplited = element.split(',');
                                    let startDateTime = elementSplited[0];
                                    let endDateTime = elementSplited[1];
                                    this.dateSelected = startDateTime.split(' ')[0];
                                    let startTime = startDateTime.split(' ')[1];
                                    let endTime = endDateTime.split(' ')[1];
                                    startTime = startTime.split(':')[0] + ':' + startTime.split(':')[1];
                                    endTime = endTime.split(':')[0] + ':' + endTime.split(':')[1];
                                    let slot = startTime + ' - ' + endTime;
                                    slots.push(slot);
                                }
                                count++;
                            });
                            this.timeSlots = slots;
                            this.template.querySelector('.loader').style.display = 'none';
                            this.template.querySelector('.timeSlots').style.display = 'flex';

                        }
                    }).catch(error => {
                        console.debug('Some error is there')
                        console.debug(error);
                    })
                }
            }
        }

    }

    activeMonth;

    addMonth() {

        let year = parseInt(this.template.querySelector('.year').innerHTML);
        if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
            this.daysInMonths[1] = 29;
        } else {
            this.daysInMonths[1] = 28;
        }

        this.template.querySelectorAll('.calender-day').forEach(element => {
            element.classList.remove('active');
            element.classList.remove('today');
        })
        this.carDetailsVisibility = false;
        this.template.querySelector('.goToPayment').style.display = 'none';
        this.template.querySelector('.timeSlots').style.display = 'none';
        this.template.querySelector('.noTimeSlots').style.display = 'none';


        if (this.activeMonth == 12) {
            this.template.querySelector('.year').innerHTML = parseInt(this.template.querySelector('.year').innerHTML) + 1;
            this.template.querySelector('.month').innerHTML = this.months[0];
            this.createCalender(this.template.querySelector('.month').innerHTML);
            this.activeMonth = 1;
        }
        else {

            this.template.querySelector('.month').innerHTML = this.months[this.months.indexOf(this.template.querySelector('.month').innerHTML) + 1];
            this.createCalender(this.months[this.months.indexOf(this.template.querySelector('.month').innerHTML)]);
            this.activeMonth = this.activeMonth + 1;
        }
        this.addBorderToTodaysDate();
    }
    reduceMonth() {

        let year = parseInt(this.template.querySelector('.year').innerHTML);
        if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
            this.daysInMonths[1] = 29;
        } else {
            this.daysInMonths[1] = 28;
        }

        this.template.querySelectorAll('.calender-day').forEach(element => {
            element.classList.remove('active');
            element.classList.remove('today');
        })
        this.carDetailsVisibility = false;

        this.template.querySelector('.goToPayment').style.display = 'none';
        this.template.querySelector('.timeSlots').style.display = 'none';
        this.template.querySelector('.noTimeSlots').style.display = 'none';

        if (this.activeMonth == 1) {
            this.template.querySelector('.year').innerHTML = parseInt(this.template.querySelector('.year').innerHTML) - 1;
            this.template.querySelector('.month').innerHTML = this.months[11];
            this.activeMonth = 12;
        }
        else {
            this.template.querySelector('.month').innerHTML = this.months[this.months.indexOf(this.template.querySelector('.month').innerHTML) - 1];
            this.createCalender(this.months[this.months.indexOf(this.template.querySelector('.month').innerHTML)]);
            this.activeMonth = this.activeMonth - 1;

        }
        this.addBorderToTodaysDate();
    }

    initial = 0;
    monthDays;
    renderedCallback() {
        if (this.showCalender == true) {
            if (this.initial == 0) {
                let today = new Date();
                let day = today.getDate();
                let month = today.getMonth() + 1;
                let year = today.getFullYear();
                this.template.querySelector('.month').innerHTML = this.months[month - 1];
                this.activeMonth = month;
                this.createCalender(this.template.querySelector('.month').innerHTML);
                this.template.querySelector('.year').innerHTML = year;
                this.createCalender(this.template.querySelector('.month').innerHTML);

                this.template.querySelectorAll('.calender-day').forEach(element => {
                    if (parseInt(element.innerHTML) == parseInt(day)) {
                        element.classList.add('today');
                    }
                });
                this.initial++;
            }
            this.loader = false;
        }
    }


    addBorderToTodaysDate() {
        let dateToday = new Date();
        let currentMonthOnCalender = this.months.indexOf(this.template.querySelector('.month').innerHTML);
        let currentYearOnCalender = this.template.querySelector('.year').innerHTML;
        if (parseInt(dateToday.getMonth()) == parseInt(currentMonthOnCalender) && parseInt(dateToday.getFullYear()) == parseInt(currentYearOnCalender)) {
            this.template.querySelectorAll('.calender-day').forEach(element => {
                if (parseInt(element.innerHTML) == parseInt(dateToday.getDate())) {
                    element.classList.add('today');
                }
            });
        }
    }

    createCalender(month) {
        let extraDays = this.template.querySelectorAll('.extras');
        extraDays.forEach(element => {
            element.style.display = 'block';
        });
        this.monthDays = this.template.querySelectorAll('.calender-day');

        let newDate = new Date();
        newDate.setDate('1');
        newDate.setMonth(this.months.indexOf(month));
        newDate.setFullYear(parseInt(this.template.querySelector('.year').innerHTML));
        let dayToday = newDate.getDay();
        if (dayToday == 0) {
            dayToday = 7;
        }
        let allDates = 1;
        for (let i = 0; i < this.monthDays.length; i++) {

            if (i < dayToday - 1 || i > this.daysInMonths[this.months.indexOf(month)] + dayToday - 2) {
                this.monthDays[i].innerHTML = '';
                this.monthDays[i].classList.add('disabled');
            }
            else {
                this.monthDays[i].classList.remove('disabled');
                this.monthDays[i].innerHTML = allDates;
                allDates++;
            }
        }

        extraDays.forEach(element => {
            if (element.classList.contains('extras')) {
                if (element.innerHTML == "") {
                    element.style.display = 'none';
                }
            }
        });
    }

    hideAppointmentBooking() {
        const customEventVar = new CustomEvent('hideaddbooking', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar);
    }

    woId;
    workOrderId = '0WO3M000001OghnWAC';
    leadId;
    listOfAddons;
    @api serviceResourceJSON;
    paymenthMethodChoosen;
    currentCurrency;
    country;
    noOfCars;
    subscriptionMonths;

    @api setWorkOrderId(workOrderId, customerType, leadId, listOfAddons, totalPrice, paymenthMethodChoosen, currentCurrency, country, subscriptionMonths, noOfCars) {
        this.workOrderId = workOrderId;
        this.customerType = customerType;
        this.leadId = leadId;
        this.listOfAddons = listOfAddons;
        this.totalPrice = totalPrice;
        this.paymenthMethodChoosen = paymenthMethodChoosen;
        this.currentCurrency = currentCurrency;
        this.country = country;
        this.subscriptionMonths = subscriptionMonths;
        this.noOfCars = noOfCars;
    }

    numbersOfCars;
    carsarray = [];
    bookAppointment() {
            var self = this;
            let fieldEmpty = false;
                    this.template.querySelectorAll('.carDetailsInput').forEach(element => {
                        if (element.value == "" || element.value == null || element.value == undefined) {
                            fieldEmpty = true;
                        }
                    });
                     if(this.template.querySelector('.carYear').value.length != 4 || parseInt(this.template.querySelector('.carYear').value) < 1990){
                            fieldEmpty = true;
                        }
                    if (fieldEmpty == false) {
            this.template.querySelector('.loader').style.display = 'block';
            var startTime = this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[0] + ':00';
            var endTime = this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[1] + ':00';
            submitForm({ SAId: this.serviceAppointmentId, brand: this.template.querySelector('.carBrandModel').value, plate: this.template.querySelector('.colorPlateNumber').value, carYear: this.template.querySelector('.carYear').value, phoneNum: this.template.querySelector('.mobileNo').value })
                .then(result => {

                    let workOrderPrice = this.existingQuoteOptionsRecords.filter((element) => {
                        if (element.Id == this.workOrderId) {
                            return element.price;
                        };
                    });

                    updateServiceAppointmentTotalPrice({ SAId: this.serviceAppointmentId, price: workOrderPrice[0].price }).then(result => {

                        sendTime({ worderId: this.woId, startT: startTime, endT: endTime, Currencystr: this.currentCurrency })
                            .then(result => {
                                try {
                                    var count = 1;
                                    var timerId = setInterval(fun=>{
                                        getServiceResource({apptId : result}).then(res=>{
                                            if(res != null)
                                            {
                                                clearInterval(timerId);
                                                console.log(res);
                                                this.serviceResourceJSON = result;
                                                this.assignedResource = res.Name;
                                                var sig = res.Ratings__c;
                                                var d = sig.split('<');
                                                var e = d[1].split('=');
                                                var f = e[1].split(' ');
                                                var g = f[0].split('"');
                                                console.log(this.assignedResource);
                                                console.log(this.rating);
                                                this.rating = `https://zawash.my.site.com/` + g[1];
                                                this.booking = false;
                                                this.template.querySelector('.loader').style.display = 'none';
                                                this.callgetappointments();
                                            }else{
                                                count++;
                                            }
                                        })
                                        if(count == 3)
                                        {
                                            clearInterval(timerId);
                                            assignedResource = "No Resource Available, Please try again !!" ;
                                            this.resourceNotFound = true;
                                        }
                                    }, 4000)
                                }
                                catch (err) {
                                }
                            }).catch(error => {
                            })
                    }).catch(error => {
                    })

                }).catch(err => {
                })

        }
         else {
                        this.template.querySelector('.errorMsg').innerHTML = this.label.Please_fill_all_the_details;
                        this.template.querySelector('.Error').style.display = 'block';
                        setTimeout(() => { this.template.querySelector('.Error').style.display = 'none'; }, 3000);
                    }
    }


    btnClicked(event) {
        this.template.querySelectorAll('.slot').forEach(element => {
            element.style.background = 'white';
            element.style.color = 'black';
        });
        event.target.style.background = '#187C29';
        event.target.style.color = 'white';
        this.selectedTimeSlot = event.target.innerHTML;

        this.carDetailsVisibility = true;
        this.template.querySelector('.goToPayment').style.display = 'block';
    }

    hideError(event) {
        if (!event.target.classList.contains('goToPayment')) {
            this.template.querySelector('.Error').style.display = 'none';
        }
    }

    onlyNumericAllowed(event) {
        const value = event.target.value;
        var leng = event.target.value.length;
        const reg = /^[0-9]*$/;
        if (leng === 4) {
            if (!reg.test(value) || value > parseInt(new Date().getFullYear())) {
                this.template.querySelector('.carYear').value = this.prevCarYear;
            } else {
                this.prevCarYear = value;
            }
        } else {
            if (!reg.test(value)) {
                this.template.querySelector('.carYear').value = this.prevCarYear;
            } else {
                this.prevCarYear = value;
            }
        }
    }

}