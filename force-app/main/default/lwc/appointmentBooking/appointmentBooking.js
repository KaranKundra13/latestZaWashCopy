import { LightningElement, api, track } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import createCustomerOrders from '@salesforce/apex/getSlots.createCustomerOrders';
import convertLead from '@salesforce/apex/getSlots.convertLead';
import submitForm from '@salesforce/apex/getSlots.submitForm';
import getTimeSlots from '@salesforce/apex/getSlots.getTimeSlots';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
import getFinalPrice from '@salesforce/apex/getSlots.getFinalPrice';
import updateWorkOrder from '@salesforce/apex/zawashHelperClass.updateWorkOrder';

import getCustomizeAddons from '@salesforce/apex/getSlots.getCustomizeAddons';
export default class AppointmentBooking extends LightningElement {
    leftAngle = icons + '/ZawashIcons/leftAngle.webp';
    rightAngle = icons + '/ZawashIcons/rightAngle.png';

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

    loader1 = false;

    @api textLanguage;

    connectedCallback() {

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

    @api months;

    daysInMonths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    timeSlots = [];
    loader = false;
    dateSelected;
    selectedTimeSlot;
    customerType;
    AccountId;
    carDetailsVisibility = false;

    countryCodeOptions;
    selectedCountryCode;
    mobileNoEntered = '';

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

        this.countryCodeOptions = item;
        setTimeout(() => {
            countryCodes.forEach(element => {
                item.push({ label: element, value: element.split('(')[1].split(')')[0] });
                if (element.split('(')[0].includes(this.currentAddress.split(',')[this.currentAddress.split(',').length - 1].trim())) {
                    this.selectedCountryCode = element.split('(')[1].split(')')[0];
                }
            });
            if (this.selectedCountryCode == undefined) {
                this.selectedCountryCode = '+41';
            }
        }, 0)
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

    handleCountryCodeChange(event) {
        this.selectedCountryCode = event.detail.value;
    }

    serviceAppointmentId;

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
                this.dateSelected = this.template.querySelector('.year').innerHTML + '-' + (this.months.indexOf(this.template.querySelector('.month').innerHTML) + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) + '-' + event.target.innerHTML;
                getTimeSlots({ SelectedDate: selectedDate, workOrderId: this.workOrderId, cusType: this.customerType, Address: this.currentAddress, Duration: this.totalTimeTakenInService }).then(result => {

                    if (result.length == 1 || selectedDate.getDay() == 0 || selectedDate.getDay() == 6 || selectedDate < new Date()) {
                        this.template.querySelector('.noTimeSlots').style.display = 'block';
                        this.template.querySelector('.loader').style.display = 'none';
                    }
                    else {
                        let slots = [];
                        let slotsTimezone=[];
                        this.serviceAppointmentId = result[result.length - 1];
                        result.pop();
                        result.forEach(element => {

                            let elementSplited = element.split(',');
                            let startDateTime = elementSplited[0];
                            let endDateTime = elementSplited[1];
                            this.dateSelected = startDateTime.split(' ')[0];
                            let startTime = startDateTime.split(' ')[1];
                            let endTime = endDateTime.split(' ')[1];
                            startTime = startTime.split(':')[0] + ':' + startTime.split(':')[1];
                            endTime = endTime.split(':')[0] + ':' + endTime.split(':')[1];
                            let slot = startTime + ' - ' + endTime;
                            let newStartTime = this.incrementTimeByOneHour(startTime,this.timezone);
    let newEndTime = this.incrementTimeByOneHour(endTime,this.timezone);
        let newSlot = newStartTime + ' - ' + newEndTime;

                            slots.push(slot);
                             slotsTimezone.push(newSlot);
                        });
                        this.timeSlots = slotsTimezone;

                        this.template.querySelector('.loader').style.display = 'none';
                        this.template.querySelector('.timeSlots').style.display = 'flex';
                    }
                }).catch(error => {
                })
            }
        }

    }

timezone=2;
/////////////////////////////////// Increment Method//////////////////////////////////
    incrementTimeByOneHour(time,timezone) {
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        
        // Increment the hours by 1
        hours += timezone;
        
        // Adjust hours and minutes if necessary
        if (hours >= 24) {
            hours -= 24;
        }
        
        // Convert hours and minutes to string format
        hours = hours.toString().padStart(2, '0');
        minutes = minutes.toString().padStart(2, '0');
        
        return hours + ':' + minutes;
    }

    msToTime(duration) {
        var milliseconds = Math.floor((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
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
        const customEventVar = new CustomEvent('hideappointmentbooking', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar);
    }

    workOrderId;
    leadId;
    listOfAddons;
    @api serviceResourceJSON;
    paymenthMethodChoosen;
    currentCurrency;
    country;
    noOfCars;
    subscriptionMonths;
    serviceChoosen;
    currentAddress;
    mobileNoEntered;
    totalTimeTakenInService;

    @api setWorkOrderId(workOrderId, customerType, leadId, listOfAddons, totalPrice, paymenthMethodChoosen, currentCurrency, country, subscriptionMonths, noOfCars, serviceChoosen, currentAddress, mobileNoEntered, totalTimeTakenInService) {
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
        this.serviceChoosen = serviceChoosen;
        this.currentAddress = currentAddress;
        this.mobileNoEntered = mobileNoEntered;
        this.totalTimeTakenInService = totalTimeTakenInService;


        if (customerType == 'requestQuote') {
            const customEventVar1 = new CustomEvent('hideservicecomponent', { detail: 'hide', bubbles: true });
            this.dispatchEvent(customEventVar1);
        }

    }

    numbersOfCars;
    carsarray = [];
    allAddons = [];
    showAddons = false;
    totalB2BPrice;
    showSummary = false;
    summaryIcon;
    customerData = [];
    checkCount = 1;


    subtractHoursFromDate(dateTime, hours) {
    const dateObj = new Date(dateTime);
    dateObj.setHours(dateObj.getHours() - hours);
    return dateObj.toISOString().slice(0, 19);
}

    goToPayment() {
        if (this.customerType == 'requestQuote') {

            updateWorkOrder({ workorderId: this.workOrderId, address: this.currentAddress }).then(result => { }).catch(error => {
            })

            this.template.querySelector('.calenderContent').style.display = 'none';
            this.template.querySelector('.thankyouText').style.display = 'block';
            this.loader1 = true;

            let detailsJson = {
                paymenthMethodChoosen: this.paymenthMethodChoosen,
                dateSelected: this.dateSelected,
                currentCurrency: this.currentCurrency,
                country: this.country,
                workOrderId: this.workOrderId,
                startTime: this.subtractHoursFromDate(this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[0] + ':00', this.timezone),
                endTime: this.subtractHoursFromDate(this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[1] + ':00', this.timezone),
                leadId: this.leadId,
                subscriptionMonths: this.subscriptionMonths,
                noOfCars: this.noOfCars
            }

            let toatlPriceAfterMultiplicationWithNoOfCars = this.totalPrice * parseInt(this.noOfCars);

            createCustomerOrders({ addOns: this.listOfAddons, LeadId: this.leadId, woId: this.workOrderId, totalPrice: toatlPriceAfterMultiplicationWithNoOfCars, payData: JSON.stringify(detailsJson), SaId: this.serviceAppointmentId, mobileNoEntered: this.mobileNoEntered }).then(result => {
                getCustomizeAddons({ woId: this.workOrderId })
                    .then(result => {
                        if ('WorkTypeId' in result[0]) {
                            let ob = [];
                            if ('LeadId__r' in result[0]) {
                                ob.push({
                                    'key': this.label.Customers_email,
                                    'value': result[0].LeadId__r.Email
                                })

                                ob.push({
                                    'key': this.label.Quote_Number,
                                    'value': result[0].zaWash_Quotes__r[0].Name
                                })

                                ob.push({
                                    'key': this.label.Phone,
                                    'value': this.selectedCountryCode + ' ' + result[result.length - 2].zaWash_Quotes__r[0].Phone__c
                                })

                                ob.push({
                                    'key': this.label.serviceDate,
                                    'value': this.dateSelected.split('-')[2] + '.' + this.dateSelected.split('-')[1] + '.' + this.dateSelected.split('-')[0]
                                })

                                ob.push({
                                    'key': this.label.Service_time,
                                    'value': this.selectedTimeSlot
                                })


                                ob.push({
                                    'key': this.label.Address,
                                    'value': this.currentAddress
                                })

                            }
                            if ('AccountId' in result[0]) {
                                ob.push({
                                    'key': this.label.Customers_email,
                                    'value': result[0].Account.Email__c
                                })
                                ob.push({
                                    'key': this.label.Quote_Number,
                                    'value': result[0].zaWash_Quotes__r[0].Name
                                })

                                ob.push({
                                    'key': this.label.Phone,
                                    'value': this.selectedCountryCode + ' ' + result[result.length - 2].zaWash_Quotes__r[0].Phone__c
                                })

                                ob.push({
                                    'key': this.label.serviceDate,
                                    'value': this.dateSelected.split('-')[2] + '.' + this.dateSelected.split('-')[1] + '.' + this.dateSelected.split('-')[0]
                                })

                                ob.push({
                                    'key': this.label.Service_time,
                                    'value': this.selectedTimeSlot
                                })


                                ob.push({
                                    'key': this.label.Address,
                                    'value': this.currentAddress
                                })
                            }

                            for (let i = result.length; i > 0; i--) {
                                if ('Name' in result[i - 1]) {

                                    ob.push({
                                        'key': this.label.Service,
                                        'value': result[i - 1].Name
                                    })

                                }
                                else {
                                    ob.push({
                                        'key': this.label.Number_of_Cars,
                                        'value': result[i - 1].numberOfCars__c
                                    })
                                }

                            }

                            this.allAddons = ob;
                            this.summaryIcon = `https://zawash--sandbox.sandbox.my.site.com/zaWash/resource/1667568188000/Zawash` + result[1].icon__c;
                            this.totalB2BPrice = result[1].Price__c
                            if (String(result[1].Price__c).includes('.')) {
                                this.totalB2BPrice = result[1].Price__c
                            } else {
                                this.totalB2BPrice = result[1].Price__c + '.00'
                            }
                            this.loader1 = false;

                            this.showSummary = true;
                            this.template.querySelector('.progress').style.width = '100%';
                        } else {
                            if (result.length > 0) {
                                let customerData = [];
                                this.summaryIcon = `https://zawash--sandbox.sandbox.my.site.com/zaWash/resource/1667568188000/Zawash` + result[result.length - 1].icon__c;

                                let totalB2BPrice = 0;
                                if ('LeadId__c' in result[result.length - 2]) {
                                    customerData = [

                                        { 'Name': this.label.Quote_Number, 'Quantity__c': result[result.length - 2].zaWash_Quotes__r[0].Name },
                                        { 'Name': this.label.Customers_email, 'Quantity__c': result[result.length - 2].LeadId__r.Email },
                                        {
                                            'Name': this.label.Number_of_Cars, 'Quantity__c': result[result.length - 2].numberOfCars__c
                                        },

                                        { 'Name': this.label.Phone, 'Quantity__c': this.selectedCountryCode + ' ' + result[result.length - 2].zaWash_Quotes__r[0].Phone__c },
                                        { 'Name': this.label.serviceDate, 'Quantity__c': this.dateSelected.split('-')[2] + '.' + this.dateSelected.split('-')[1] + '.' + this.dateSelected.split('-')[0] },
                                        { 'Name': this.label.Service_time, 'Quantity__c': this.selectedTimeSlot },
                                        { 'Name': this.label.Address, 'Quantity__c': this.currentAddress },

                                    ]
                                    this.customerData = customerData;
                                } else {
                                    customerData = [
                                        { 'Name': this.label.Quote_Number, 'Quantity__c': result[result.length - 2].zaWash_Quotes__r[0].Name },
                                        { 'Name': this.label.Customers_email, 'Quantity__c': result[result.length - 2].Account.Email__c },
                                        {
                                            'Name': this.label.Number_of_Cars, 'Quantity__c': result[result.length - 2].numberOfCars__c
                                        },
                                        { 'Name': this.label.Phone, 'Quantity__c': this.selectedCountryCode + ' ' + result[result.length - 2].zaWash_Quotes__r[0].Phone__c },
                                        { 'Name': this.label.serviceDate, 'Quantity__c': this.dateSelected.split('-')[2] + '.' + this.dateSelected.split('-')[1] + '.' + this.dateSelected.split('-')[0] },
                                        { 'Name': this.label.Service_time, 'Quantity__c': this.selectedTimeSlot },
                                        { 'Name': this.label.Address, 'Quantity__c': this.currentAddress },

                                    ]
                                    this.customerData = customerData;
                                }
                                let ob = [];
                                ob.push(...result);
                                ob.splice(ob.length - 2, 2);
                                this.allAddons = ob;
                                this.loader1 = false;

                                this.showAddons = true;
                                this.template.querySelector('.progress').style.width = '100%';

                                for (let i = 0; i < result.length - 2; i++) {
                                    totalB2BPrice += parseFloat(result[i].Price__c) * parseInt('1')
                                }
                                // this.totalB2BPrice = totalB2BPrice;
                                if (String(totalB2BPrice).includes('.')) {
                                    this.totalB2BPrice = result[1].Price__c
                                } else {
                                    this.totalB2BPrice = result[1].Price__c + '.00'
                                }

                            }
                        }

                    }).catch(error => {
                    })
                getFinalPrice({ serviceApptId: this.serviceAppointmentId }).then(res => {
                    if (this.checkCount == 1) {
                        this.totalPrice = res;
                        this.checkCount++;
                    }
                    convertLead({ LeadId: this.leadId, woId: this.workOrderId }).then(result => {
                        this.AccountId = result;
                        this.leadId = this.AccountId;

                        const customEventVar1 = new CustomEvent('updateleadid', { detail: result, bubbles: true });
                        this.dispatchEvent(customEventVar1);
                    })
                }).catch(error => {
                })
            }).catch(error => {
            })
        }
        else {
            if (this.customerType == 'bookNow') {
                // if (this.template.querySelector('.carYear').value.length == 4 && parseInt(this.template.querySelector('.carYear').value) > 1990) {
                let fieldEmpty = false;
                this.template.querySelectorAll('.carDetailsInput').forEach(element => {
                    if (element.value == "" || element.value == null || element.value == undefined) {
                        fieldEmpty = true;
                    }
                });
                if (this.template.querySelector('.carYear').value.length != 4 || parseInt(this.template.querySelector('.carYear').value) < 1990) {
                    fieldEmpty = true;
                }
                if (fieldEmpty == false) {


                    let carYear = this.template.querySelector('.carYear').value;
                    let currentDate = new Date();

                    if (parseInt(carYear) != undefined || parseInt(carYear) != NaN || parseInt(carYear) != "") {
                        console.log('DateTime : ' + this.dateSelected + ' - ' + this.selectedTimeSlot);
                        let startTime = this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[0] + ':00';
                        let endTime = this.dateSelected + ' ' + this.selectedTimeSlot.split(' - ')[1] + ':00';

                        this.template.querySelector('.loader').style.display = 'block';
                        this.mobileNoEntered = this.selectedCountryCode + ' ' + this.template.querySelector('.mobileNo').value;
                        submitForm({ SAId: this.serviceAppointmentId, brand: this.template.querySelector('.carBrandModel').value, plate: this.template.querySelector('.colorPlateNumber').value, carYear: this.template.querySelector('.carYear').value, phoneNum: this.mobileNoEntered }).then(result => {
                            let detailsJson;
                            createCustomerOrders({ addOns: this.listOfAddons, LeadId: this.leadId, woId: this.workOrderId, totalPrice: this.totalPrice, payData: detailsJson, SaId: this.serviceAppointmentId, mobileNoEntered: this.mobileNoEntered }).then(result => {
                                getFinalPrice({ serviceApptId: this.serviceAppointmentId }).then(res => {
                                    if (this.checkCount == 1) {
                                        this.totalPrice = res;
                                        this.checkCount++;
                                    }
                                    ///Lead convert function
                                    convertLead({ LeadId: this.leadId, woId: this.workOrderId }).then(result => {
                                        this.AccountId = result;
                                        this.leadId = this.AccountId;
                                        const customEventVar = new CustomEvent('gotopayment', { detail: [true, this.dateSelected, startTime, endTime, this.AccountId, this.totalPrice, this.serviceAppointmentId], bubbles: true });
                                        this.dispatchEvent(customEventVar);
                                        const customEventVar1 = new CustomEvent('updateleadid', { detail: result, bubbles: true });
                                        this.dispatchEvent(customEventVar1);

                                        this.template.querySelector('.loader').style.display = 'none';
                                    })
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
                                this.mobileNoEntered = this.selectedCountryCode + ' ' + this.template.querySelector('.mobileNo').value;
                                submitForm({ LeadId: this.leadId, brand: this.template.querySelector('.carBrandModel').value, plate: this.template.querySelector('.colorPlateNumber').value, carYear: this.template.querySelector('.carYear').value, phoneNum: this.mobileNoEntered }).then(result => {


                                    let detailsJson;
                                    createCustomerOrders({ addOns: this.listOfAddons, LeadId: this.leadId, woId: this.workOrderId, totalPrice: this.totalPrice, payData: detailsJson, SaId: this.serviceAppointmentId, mobileNoEntered: this.mobileNoEntered }).then(result => {
                                        getFinalPrice({ serviceApptId: this.serviceAppointmentId }).then(res => {
                                            if (this.checkCount == 1) {
                                                this.totalPrice = res;
                                                this.checkCount++;
                                            }
                                            ///Lead convert function
                                            convertLead({ LeadId: this.leadId, woId: this.workOrderId }).then(result => {
                                                this.AccountId = result;
                                                this.leadId = this.AccountId;
                                                const customEventVar = new CustomEvent('gotopayment', { detail: [true, this.dateSelected, startTime, endTime, this.AccountId, this.totalPrice, this.serviceAppointmentId], bubbles: true });
                                                this.dispatchEvent(customEventVar);
                                                const customEventVar1 = new CustomEvent('updateleadid', { detail: result, bubbles: true });
                                                this.dispatchEvent(customEventVar1);

                                                this.template.querySelector('.loader').style.display = 'none';
                                            }).catch(error => {
                                                this.template.querySelector('.loader').style.display = 'none';
                                            })
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
                // }
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

        if (this.customerType == 'bookNow') {
            this.carDetailsVisibility = true;
        }
        this.template.querySelector('.goToPayment').style.display = 'block';
    }

    hideError(event) {
        if (!event.target.classList.contains('goToPayment')) {
            this.template.querySelector('.Error').style.display = 'none';
        }
    }

    prevCarYear;
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