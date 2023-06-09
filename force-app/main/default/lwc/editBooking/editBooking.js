import { LightningElement, api, track } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import createCustomerOrders from '@salesforce/apex/getSlots.createCustomerOrders';
import convertLead from '@salesforce/apex/getSlots.convertLead';
import submitForm from '@salesforce/apex/getSlots.submitForm';
// import encryptCustomer from '@salesforce/apex/getSlots.encryptCustomer';
import getTimeSlots from '@salesforce/apex/getSlots.getTimeSlots';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
import getQuotes from '@salesforce/apex/zawashHelperClass.getQuotes';

export default class EditBooking extends LightningElement {
    leftAngle = icons + '/ZawashIcons/leftAngle.webp';
    rightAngle = icons + '/ZawashIcons/rightAngle.png';
    QuoteOptions;
    existingQuoteOptions;
    quotes;

    countryCodes = [93, 355, 213, 1 - 684, 376, 244, 1 - 264, 672, 1 - 268, 672, 1 - 264, 54, 374, 297, 61, 43, 994, 1 - 242, 973, 880, 1 - 246, 375, 32, 501, 229, 1 - 441, 975, 591, 387, 267, 55, 246, 1 - 284];
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

    getSelectedQuoteData(event){
    
        let selectedQuote;
        this.quotes.forEach(element=>{
            if(element.Id == event.detail.value){
                selectedQuote = element;
            }
        })


        
    }
 
    connectedCallback() {

        getQuotes({accId:'0013M00001Fd3ePQAR'}).then(quote=>{

            
            this.quotes = quote;
            let item = [];

            quote.forEach(element => {
                item.push({label:element.Subject , value:element.Id});
            });

            this.existingQuoteOptions = item;
        })

        getLabels({ language: this.textLanguage }).then(result => {

            result.forEach(element => {
                this.label[element.Name] = element[this.textLanguage + '__c'];
            });
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

    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

    showEmailField(event){

        
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

                getTimeSlots({ SelectedDate: selectedDate, workOrderId: this.workOrderId }).then(result => {

                    
                    
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
         
                    
                })
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
        const customEventVar = new CustomEvent('hideeditbooking', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar);
    }

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
    // @api showThankyouContent() {
    //     this.template.querySelector('.calender').style.display = 'none';
    //     this.thankyouPageVisibility = true;
    // }


    numbersOfCars;
    carsarray = [];
    goToPayment() {


        if (this.customerType == 'requestQuote') {
            this.template.querySelector('.calenderContent').style.display = 'none';
            this.template.querySelector('.thankyouText').style.display = 'block';
            let detailsJson = {
                paymenthMethodChoosen: this.paymenthMethodChoosen,
                dateSelected: this.dateSelected,
                currentCurrency: this.currentCurrency,
                country: this.country,
                workOrderId: this.workOrderId,
                startTime: this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[0] + ':00',
                endTime: this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[1] + ':00',
                leadId: this.leadId,
                subscriptionMonths: this.subscriptionMonths,
                noOfCars: this.noOfCars
            }

            let toatlPriceAfterMultiplicationWithNoOfCars = parseFloat(this.totalPrice) * parseInt(this.noOfCars);


            createCustomerOrders({ addOns: this.listOfAddons, LeadId: this.leadId, woId: this.workOrderId, totalPrice: toatlPriceAfterMultiplicationWithNoOfCars, payData: JSON.stringify(detailsJson) }).then(result => {


                ///Lead convert function
                convertLead({ LeadId: this.leadId, woId: this.workOrderId }).then(result => {
                    this.AccountId = result;
                    this.leadId = this.AccountId;

                    const customEventVar1 = new CustomEvent('updateleadid', { detail: result, bubbles: true });
                    this.dispatchEvent(customEventVar1);

                    // encryptCustomer({ AccId: this.AccountId }).then(result => {

                    // }).catch(error => {

                    // })
                }).catch(error => {

                    
                })
            }).catch(error => {
            })
        }
        else {
            if (this.customerType == 'bookNow') {
                let fieldEmpty = false;
                this.template.querySelectorAll('.carDetailsInput').forEach(element => {
                    if (element.value == "" || element.value == null || element.value == undefined) {
                        fieldEmpty = true;
                    }
                });
                if (fieldEmpty == false) {
                    let carYear = this.template.querySelector('.carYear').value;
                    let currentDate = new Date();

                    if (parseInt(carYear) != undefined || parseInt(carYear) != NaN || parseInt(carYear) != "") {

                        let startTime = this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[0] + ':00';
                        let endTime = this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[1] + ':00';
                        this.template.querySelector('.loader').style.display = 'block';
                        submitForm({ LeadId: this.leadId, brand: this.template.querySelector('.carBrandModel').value, plate: this.template.querySelector('.colorPlateNumber').value, carYear: this.template.querySelector('.carYear').value }).then(result => {



                            let detailsJson;
                            createCustomerOrders({ addOns: this.listOfAddons, LeadId: this.leadId, woId: this.workOrderId, totalPrice: this.totalPrice, payData: detailsJson }).then(result => {

                                ///Lead convert function
                                convertLead({ LeadId: this.leadId, woId: this.workOrderId }).then(result => {
                                    this.AccountId = result;
                                    this.leadId = this.AccountId;
                                    const customEventVar = new CustomEvent('gotopayment', { detail: [true, this.dateSelected, startTime, endTime, this.AccountId], bubbles: true });
                                    this.dispatchEvent(customEventVar);
                                    const customEventVar1 = new CustomEvent('updateleadid', { detail: result, bubbles: true });
                                    this.dispatchEvent(customEventVar1);

                                    this.template.querySelector('.loader').style.display = 'none';
                                }).catch(error => {
             
                                    
                                    this.template.querySelector('.loader').style.display = 'none';
                                })
                            }).catch(error => {
                                this.template.querySelector('.loader').style.display = 'none';
                            })


                        }).catch(error => {
                        })


                    }
                    else {

                        if (parseInt(carYear) > currentDate.getFullYear()) {
                            this.template.querySelector('.errorMsg').innerHTML = this.label.Please_enter_a_valid_year_value;
                            this.template.querySelector('.Error').style.display = 'block';
                            setTimeout(() => { this.template.querySelector('.Error').style.display = 'none'; }, 3000);
                        }
                        else {
                            let numbers = /^\d+$/;
                            if (carYear.match(numbers)) {


                                let startTime = this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[0] + ':00';
                                let endTime = this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[1] + ':00';

                                this.template.querySelector('.loader').style.display = 'block';
                                submitForm({ LeadId: this.leadId, brand: this.template.querySelector('.carBrandModel').value, plate: this.template.querySelector('.colorPlateNumber').value, carYear: this.template.querySelector('.carYear').value }).then(result => {


                                    let detailsJson;
                                    createCustomerOrders({ addOns: this.listOfAddons, LeadId: this.leadId, woId: this.workOrderId, totalPrice: this.totalPrice, payData: detailsJson }).then(result => {

                                        ///Lead convert function
                                        convertLead({ LeadId: this.leadId, woId: this.workOrderId }).then(result => {
                                            this.AccountId = result;
                                            this.leadId = this.AccountId;

                                            const customEventVar = new CustomEvent('gotopayment', { detail: [true, this.dateSelected, startTime, endTime, this.AccountId], bubbles: true });
                                            this.dispatchEvent(customEventVar);
                                            const customEventVar1 = new CustomEvent('updateleadid', { detail: result, bubbles: true });
                                            this.dispatchEvent(customEventVar1);

                                            this.template.querySelector('.loader').style.display = 'none';
                                        }).catch(error => {
                
                                            
                                            this.template.querySelector('.loader').style.display = 'none';
                                        })
                                    }).catch(error => {
                                        this.template.querySelector('.loader').style.display = 'none';
                                    })




                                }).catch(error => {
                                })
                            }
                            else {
                                this.template.querySelector('.errorMsg').innerHTML = this.label.Please_enter_a_valid_year_value;
                                this.template.querySelector('.Error').style.display = 'block';
                                setTimeout(() => { this.template.querySelector('.Error').style.display = 'none'; }, 3000);
                            }
                        }
                    }
                }
                else {
                    this.template.querySelector('.errorMsg').innerHTML = this.label.Please_fill_all_the_details;
                    this.template.querySelector('.Error').style.display = 'block';
                    setTimeout(() => { this.template.querySelector('.Error').style.display = 'none'; }, 3000);
                }
            }
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

    // submitDetails() {
    //     let canSubmit = true;
    //     this.template.querySelectorAll('lightning-input').forEach(element => {
    //         if (element.value == '' || element.value == null || element.value == undefined) {
    //             canSubmit = false;
    //         }
    //     });

    //     if (canSubmit == true) {
    //         this.template.querySelector('.detailForm').style.display = 'none';
    //         this.template.querySelector('.thankyouText').style.display = 'block';
    //     }
    //     else {
    //         this.template.querySelector('.error').style.display = 'block';
    //     }
    // }


    // StoreDetailsAndShowThankyouText() {
    //     let canSave = true;
    //     this.template.querySelectorAll('.carDetailInput').forEach(element => {
    //         if (element.value == null || element.value == "") {
    //             canSave = false;
    //         }
    //     });
    //     if (canSave != true) {
    //         this.template.querySelector('.Error').style.display = 'block';
    //     }
    //     else {
    //         this.template.querySelector('.detailForm').style.display = 'none';
    //         this.template.querySelector('.thankyouText').style.display = 'block';
    //     }
    // }

    hideError(event) {
        if (!event.target.classList.contains('goToPayment')) {
            this.template.querySelector('.Error').style.display = 'none';
        }
    }
}