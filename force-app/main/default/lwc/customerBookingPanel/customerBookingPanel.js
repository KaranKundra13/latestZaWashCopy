import { api, LightningElement, track } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import rating from '@salesforce/resourceUrl/rating';
import ratingStars from '@salesforce/resourceUrl/ratingStars';
import submitRating from '@salesforce/apex/getSlots.submitRating';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createCase from '@salesforce/apex/zawashHelperClass.createCase';
import getWorkOrder from '@salesforce/apex/getSlots.getWorkOrder';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
import getAppointments from '@salesforce/apex/zawashHelperClass.getAppointments';
import createCustomerOrders from '@salesforce/apex/getSlots.createCustomerOrders';
import convertLead from '@salesforce/apex/getSlots.convertLead';
import submitForm from '@salesforce/apex/getSlots.submitForm';
import getTimeSlots from '@salesforce/apex/getSlots.getTimeSlots';
import getQuotes from '@salesforce/apex/zawashHelperClass.getQuotes';
import editAppointment from '@salesforce/apex/getSlots.editAppointment';
import cancelAppointment from '@salesforce/apex/getSlots.cancelAppointment';
import applyFilter from '@salesforce/apex/getSlots.applyFilter';
import getContactId from '@salesforce/apex/getSlots.getContactId';

export default class CustomerBookingPanel extends LightningElement {
    @api accountId;
    logo = icons + '/ZawashIcons/logo.png';
    downloadInvoice = true

    @track label = {
        Submit: "",
        Cancel: "",
        Contact_Us: "",
        Customer_Name: "",
        Billing_Amount: "",
        Error: "",
        Full_Name: "",
        Description: "",
        PleaseEnterYourEmail: "",
        Add_Ons_Selected: "",
        Confirm_Booking: "",
        Previous_Bookings: "",
        No_Previous_Bookings: "",
        Share_your_Feedback: "",
        How_much_do_you_rate_our_service: "",
        How_much_do_you_rate_our_executive: "",
        Tell_us_more_about_your_experience: ""
    }

    encryptedCustomerId;
    customerDetails;
    @api oldBookings = [];
    @api pendingBooking = [];
    lastBooking = [];
    currentBooking;

    customerBookingVisibility = true;
    error404Visibility = false;
    cardPaymentVisibility = false;
    paymentSuccessfullPageVisibility = false;
    paymentSectionVisibility = false;
    bankPaymentVisibility = false;
    noBookingsVisibility = false;
    addOnsVisibility = false;
    ratingForm = false;
    serviceResourceJSON;
    PaymentData;
    currentURL;
    currentLanguage;
    @api textLanguage = 'English';
    confirmMessage = false;
    showEditForm = false;
    editServiceDate;
    editSlotTime;
    editCarPlate;
    editCarModel;
    editCarYear;
    editDuration;
    ModalCalenderForServiceDate = false;
    successfulEditModal = false;
    washerIcon = icons + '/ZawashIcons/washer.png';
    assignedResource;
    rating = rating;
    editRecordId;
    showSpinner = false;


    editRecordDetail() {
        console.log('Slot', this.newSelectedTimeSlot);
        this.showSpinner = true;
        if (this.newSelectedTimeSlot == undefined) {
            console.log('ServiceApptId', this.editRecordId, 'carPlate', this.editCarPlate, 'carModel',this.editCarModel, 'carYear', this.editCarYear);
            editAppointment({ ServiceApptId: this.editRecordId, carPlate: this.editCarPlate, carModel: this.editCarModel, carYear: this.editCarYear })
                .then(result => {

                    this.assignedResource = result.Name;
                    let starValue = Math.floor(result.Rating__c);
                    this.rating = ratingStars + `/ratingStar/${starValue}.gif`;
                    this.successfulEditModal = true;
                    this.showEditForm = false;
                    this.showSpinner = false;
                    this.getappointments();
                }).catch(err => {
                    console.log('error', err);
                })
        } else {


            var sTime = this.dateSelected + ' ' + this.newSelectedTimeSlot.split(' - ')[0] + ':00';
            var eTime = this.dateSelected + ' ' + this.newSelectedTimeSlot.split(' - ')[1] + ':00';
            console.log(this.editRecordId.trim(), sTime, eTime);
            console.log('ServiceApptId', this.editRecordId, 'carPlate', this.editCarPlate, 'carModel',this.editCarModel, 'carYear', this.editCarYear);
            editAppointment({ ServiceApptId: this.editRecordId.trim(), carPlate: this.editCarPlate, carModel: this.editCarModel, carYear: this.editCarYear, startT: sTime, endT: eTime })
                .then(result => {

                    this.assignedResource = result.Name;
                    let starValue = Math.floor(result.Rating__c);
                    this.rating = ratingStars + `/ratingStar/${starValue}.gif`;
                    this.successfulEditModal = true;
                    this.showEditForm = false;
                    this.showSpinner = false;
                    this.getappointments();
                    
                }).catch(err => {
                    console.log(err);

                })

        }
    }
    changecarplate(event)
    {
        this.editCarPlate = event.target.value;
    }
    changecaryear(event)
    {
        this.editCarYear = event.target.value;
    }
    changecarmodel(event)
    {
        this.editCarModel = event.target.value;
    }
    closeSuccessfulEditModal() {
        this.successfulEditModal = false;
    }

    updateDateTime() {
        if (this.selectedDate == undefined || this.selectedTimeSlot == undefined) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Wrong Date or Time Selected',
                message:
                    'Select right date or time slot to update the service date and time',
                variant: 'error'
            }));
        }
        else {
            this.showEditForm = true;
            this.ModalCalenderForServiceDate = false;
            this.editServiceDate = this.selectedDate.toJSON().slice(0, 10);
            this.editSlotTime = this.selectedTimeSlot;
            this.selectedDate = undefined;
            this.selectedTimeSlot = undefined;
        }
    }

    openModalCalender() {
        this.timeSlots = [];
        this.showEditForm = false;
        this.ModalCalenderForServiceDate = true;
    }

    openEditModal() {
        this.showEditForm = true;
        this.ModalCalenderForServiceDate = false;
    }

    handleEditBooking(event) {
        this.showEditForm = true;
        if (event.type == 'openeditmodal') {
            this.editRecordId = event.detail;
        }
        else {
            this.editRecordId = event.currentTarget.dataset.id;
        }
        this.pendingBooking.forEach(element => {
            if (element.Id == this.editRecordId) {
                this.editServiceDate = element.date;
                this.editSlotTime = element.timeSlot;
                this.editCarPlate = element.carPlate == undefined ? '' : element.carPlate;
                this.editCarModel = element.carModel == undefined ? '' : element.carModel;
                this.editCarYear = element.carYear == undefined ? '' : element.carYear;
                this.editDuration = element.Duration;
            }
        });

    }

    hideEditForm() {
        this.showEditForm = false;
    }

    cancelBookingId;

    showConfirmMessage(event) {
        this.confirmMessage = true;
        if (event.type == 'opencancelmodal') {
            this.cancelBookingId = event.detail;
        }
        else {
            this.cancelBookingId = event.currentTarget.dataset.workorder;
        }
    }

    closeConfirmMessage() {
        this.confirmMessage = false;
    }

    connectedCallback() {


        getContactId()
            .then(response => {
                this.accountId = response;
                console.log(this.accountId);
                getAppointments({ accId: this.accountId }).then(appointments => {
                    console.log('appointments : ' ,appointments);
                    try {
                        let prevItem = [];
                        let pendItem = [];
                        let startDate;
                        let endDate;
                        let startTime;
                        let endTime;
                        let oneDigitNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

                        appointments.forEach(element => {
                            startDate = new Date(element.ArrivalWindowStartTime);
                             const date = new Date(startDate.toJSON().slice(0, 10));
                        const formattedDate = `${date.getDate()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                                    console.log(formattedDate);
                            endDate = new Date(element.ArrivalWindowEndTime);
                            // if (oneDigitNumbers.includes(startDate.getMinutes())) {
                            //     startTime = `${startDate.getHours() - 5}:0${startDate.getMinutes()}`;
                            // }
                            // else {
                            //     startTime = `${startDate.getHours() - 5}:${startDate.getMinutes()}`;
                            // }

                            // if (oneDigitNumbers.includes(endDate.getMinutes())) {
                            //     endTime = `${endDate.getHours() - 5}:0${endDate.getMinutes()}`;
                            // }
                            // else {
                            //     endTime = `${endDate.getHours() - 5}:${endDate.getMinutes()}`;
                            // }

                            if (element.Status == 'Completed' || element.Status == 'Cannot Complete') {

                                if (element.ServiceResources[0].Rating__c == undefined) {
                                    if (element.DurationType == 'Hours') {
                                        element.Duration = element.Duration * 60;
                                    } else if (element.DurationType == 'Minutes') {
                                        element.Duration = element.Duration;
                                    }
                                    prevItem.push({
                                        Id: element.Id,
                                        quote: element.zaWash_Quote__r.Name,
                                        customerName: element.Account.Name,
                                        status: element.Status,
                                        date: formattedDate,
                                        timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                                        serviceType: element.WorkType.Name,
                                        carPlate: element.Car_plate__c,
                                        carModel: element.Car_brand_and_model__c,
                                        carWasher: element.ServiceResources[0].ServiceResource.Name,
                                        carYear: element.Car_Year__c,
                                        rating: ratingStars + '/ratingStar/0.gif',
                                        showRatingButton: true,
                                        icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                                        Duration: element.Duration
                                    })
                                } else {
                                    if (element.DurationType == 'Hours') {
                                        element.Duration = element.Duration * 60;
                                    } else if (element.DurationType == 'Minutes') {
                                        element.Duration = element.Duration;
                                    }
                                    prevItem.push({
                                        Id: element.Id,
                                        quote: element.zaWash_Quote__r.Name,
                                        customerName: element.Account.Name,
                                        status: element.Status,
                                        date: formattedDate,
                                        timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                                        serviceType: element.WorkType.Name,
                                        carPlate: element.Car_plate__c,
                                        carModel: element.Car_brand_and_model__c,
                                        carYear: element.Car_Year__c,
                                        carWasher: element.ServiceResources[0].ServiceResource.Name,
                                        rating: ratingStars + `/ratingStar/${element.ServiceResources[0].Rating__c}.gif`,
                                        showRatingButton: false,
                                        icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                                        Duration: element.Duration
                                    })
                                }

                            }
                            else if (element.Status == 'Canceled') {
                                if (element.DurationType == 'Hours') {
                                    element.Duration = element.Duration * 60;
                                } else if (element.DurationType == 'Minutes') {
                                    element.Duration = element.Duration;
                                }
                                prevItem.push({
                                    Id: element.Id,
                                    quote: element.zaWash_Quote__r.Name,
                                    customerName: element.Account.Name,
                                    status: element.Status,
                                    date: formattedDate,
                                    timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                                    serviceType: element.WorkType.Name,
                                    carPlate: element.Car_plate__c,
                                    carModel: element.Car_brand_and_model__c,
                                    carYear: element.Car_Year__c,
                                    showRatingButton: false,
                                    rating: ratingStars + '/ratingStar/0.gif',
                                    icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                                    Duration: element.Duration
                                });
                            }
                            else {
                                // console.log('element.ServiceResources[0].ServiceResource.Name : ',element['ServiceResources']);
                              let  washerName=''
                                if(element.Status!='None'){
                                washerName=element.ServiceResources[0].ServiceResource.Name;;
                                }
                                if (element.DurationType == 'Hours') {
                                    element.Duration = element.Duration * 60;
                                } else if (element.DurationType == 'Minutes') {
                                    element.Duration = element.Duration;
                                }
                                pendItem.push({
                                    Id: element.Id,
                                    quote: element.zaWash_Quote__r.Name,
                                    customerName: element.Account.Name,
                                    status: element.Status,
                                    date: formattedDate,
                                    timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                                    serviceType: element.WorkType.Name,
                                    carPlate: element.Car_plate__c,
                                    carModel: element.Car_brand_and_model__c,
                                    carYear: element.Car_Year__c,
                                    carWasher: washerName,
                                    icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                                    Duration: element.Duration
                                })
                            }
                        });
                        this.oldBookings = prevItem;
                        this.pendingBooking = pendItem;
                        console.log('prevItem : ',prevItem, 'pendItem:',pendItem);

                    } catch (err) {
                        console.log('appointmentserr : ',err);
                    }

                }).catch(err => {
                    this.customerBookingVisibility = false;
                    this.error404Visibility = true;
                })
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
        console.log('url',window.location.href);
    }
    setSelectValueCount = 0;

    renderedCallback() {
        let today = new Date();
        let day = today.getDate();
        let month = today.getMonth() + 1;
        let year = today.getFullYear();

        setTimeout(() => {
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
            this.loader = false;
        }, 0);
    }

    currentBookingAccountId;
    currentBookingWorkTypeName;
    currentBookingtotalPricec;
    currentBookingListOfAddons;
    currentBookingListOfAddons_str;

    showAddBooking = false;

    @track showTableView = true;
    handleViewChange(event) {
        let val = event.target.value;
        if (val == 'Table') {

            this.showTableView = true;
        }
        else {
            this.showTableView = false;
        }
    }

    handleAddBooking() {
        this.showAddBooking = true;
    }

    hideAddBooking() {
        this.showAddBooking = false;
    }

    hideEditBooking() {
        this.showEditBookingComp = false;
    }

    proceedToPaymentForCustomerQuote(event) {
        this.paymentSectionVisibility = true;
        this.template.querySelector('.customerBookingPanel').style.width = 'calc(100% - 470px)';
        this.template.querySelector('.shadowOverlay').style.display = 'block';
        this.PaymentData = JSON.parse(event.target.dataset.paymentdata);
        this.currentBooking = event.target.dataset.currentbooking;
        this.currentBookingAccountId = event.target.dataset.currentbookingaccountid;
        this.currentBookingWorkTypeName = event.target.dataset.currentbookingworktypename;
        this.currentBookingtotalPricec = event.target.dataset.currentbookingtotalpricec;
        this.currentBookingListOfAddons = event.target.dataset.currentbookinglistofaddons;
        this.currentBookingListOfAddons_str = event.target.dataset.currentbookinglistofaddonsstr;
    }
    showCardPayment() {

        this.cardPaymentVisibility = true;
    }

    hideCardPayment() {
        this.cardPaymentVisibility = false;
    }

    hidePayment() {
        this.paymentSectionVisibility = false;
        this.template.querySelector('.customerBookingPanel').style.width = '100%';
        this.template.querySelector('.shadowOverlay').style.display = 'none';
    }

    showBankPayment() {
        this.bankPaymentVisibility = true;
    }

    hideBankPayment() {
        this.bankPaymentVisibility = false;
    }

    paymentSuccessfull() {
        this.paymentSuccessfullPageVisibility = true;
        this.serviceResourceJSON = this.template.querySelector('c-card-payment').serviceResourceJSON;
        setTimeout(() => {
            this.template.querySelector('c-payment-successful-page').setserviceResourceJSON(this.serviceResourceJSON);
        }, 0);
    }

    closeModal() {
        this.ratingForm = false;
    }

    submitRating() {

        if (this.serviceRating == undefined || this.washerRating == undefined) {
            this.template.querySelector('.Error').style.display = 'block';
            this.template.querySelector('.ErrorMsg').innerHTML = this.label.Please_Select_Rating_before_submit;
            setTimeout(() => { this.template.querySelector('.Error').style.display = 'none'; }, 3000);
        }
        else {


            submitRating({ rate: this.washerRating, SAId: this.serAppIdForRatingForm }).then(result => {
                const customEvent = new ShowToastEvent({
                    title: this.label.Success_Your_feedback_has_record,
                    variant: 'Success'
                });
                this.dispatchEvent(customEvent);
                this.getAppointments();
                this.ratingForm = false;
            }).catch(error => {
            })
        }
    }

    serAppIdForRatingForm;

    addRating(event) {
        if (event.type == 'openaddrating') {
            this.serAppIdForRatingForm = event.detail;
        }
        else {
            this.serAppIdForRatingForm = event.target.dataset.workorder;
        }
        this.ratingForm = true;
    }

    serviceRating;
    washerRating;

    serviceRatingChanged(event) {
        event.target.parentElement.querySelectorAll('label').forEach(element => {
            element.style.color = '#ccc';
        });
        event.target.parentElement.querySelectorAll('label').forEach(element => {
            if (element.dataset.value <= event.target.dataset.value) {
                element.style.color = 'green';
            }
        });
        this.serviceRating = event.target.dataset.value;
    }

    washerRatingChanged(event) {
        event.target.parentElement.querySelectorAll('label').forEach(element => {
            element.style.color = '#ccc';
        });
        event.target.parentElement.querySelectorAll('label').forEach(element => {
            if (element.dataset.value <= event.target.dataset.value) {
                element.style.color = 'green';
            }
        });
        this.washerRating = event.target.dataset.value;
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
            var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (userEmail.match(mailformat)) {
                this.template.querySelector('.contactUsLoader').style.display = 'block';
                createCase({ name: userName, Email: userEmail, Subject: userSubject })
                    .then(result => {
                        this.template.querySelector('.contactUsLoader').style.display = 'block';
                        this.showCase = false;
                        const event = new ShowToastEvent({
                            title: this.label.Success_Your_Enquiry_has_been_,
                            variant: 'Success'
                        });
                        this.dispatchEvent(event);
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

    showFilterBy = false;
    showStatus = false;
    showServiceType = false;
    showCarYear = false;
    showServiceDate = false;
    showServiceDate = false;
    filterValues = [];
    yearList = [];
    filterChange(event) {
        this.showFilterBy = true;
        if (event.target.value == 'Status') {
            this.showStatus = true;
            this.showServiceType = false;
            this.showCarYear = false;
            this.showServiceDate = false;

        }
        else if (event.target.value == 'Name') {
            this.showServiceType = true;
            this.showStatus = false;
            this.showCarYear = false;
            this.showServiceDate = false;
        }
        else if (event.target.value == 'Car_Year__c') {
            this.showCarYear = true;
            this.showStatus = false;
            this.showServiceType = false;
            this.showServiceDate = false;
            let currYear = 1950;
            while (new Date().getFullYear() >= (currYear)) {
                if ((currYear + 15) <= new Date().getFullYear()) {
                    let next = currYear + 15;
                    let str = currYear;
                    str = str + ' - ' + next;
                    this.yearList.push(str);
                    currYear = currYear + 15;
                }
                else {
                    let next = new Date().getFullYear();
                    let str = currYear;
                    str = str + ' - ' + next;
                    this.yearList.push(str);
                    break;
                }
            }

        }
        else if (event.target.value == 'All') {
            this.showServiceDate = false;
            this.showStatus = false;
            this.showServiceType = false;
            this.showCarYear = false;
            console.log(this.accountId);
            getAppointments({ accId: this.accountId }).then(app => {

                this.ViewData(app);
            })
                .catch(err => {


                })

        }
        else {
            this.showServiceDate = true;
            this.showStatus = false;
            this.showServiceType = false;
            this.showCarYear = false;
        }
    }

    openTab(event) {
        if (event.currentTarget.dataset.id == 'tab-1') {
            this.template.querySelector('[data-id="tab-1"]').className = 'slds-tabs_default__item slds-active active-tab';
            this.template.querySelector('[data-id="tab-default-1"]').className = 'slds-tabs_default__content slds-show';
            this.template.querySelector('[data-id="tab-default-2"]').className = 'slds-tabs_default__content slds-hide';
            this.template.querySelector('[data-id="tab-2"]').className = 'slds-tabs_default__item inactive-tab';
        }
        else {
            this.template.querySelector('[data-id="tab-2"]').className = 'slds-tabs_default__item slds-active active-tab';
            this.template.querySelector('[data-id="tab-default-2"]').className = 'slds-tabs_default__content slds-show';
            this.template.querySelector('[data-id="tab-default-1"]').className = 'slds-tabs_default__content slds-hide';
            this.template.querySelector('[data-id="tab-1"]').className = 'slds-tabs_default__item inactive-tab';
        }
    }

@track languagechange;
    languageChanged(event) {

        if (event.target.value == 'en_US') {
            this.languagechange='en_US';
            this.textLanguage = 'English';
        }
        if (event.target.value == 'fr_CH') {
            this.languagechange='fr_CH';
            this.textLanguage = 'French';
        }
        if (event.target.value == 'de_CH') {
            this.languagechange='de_CH';
            this.textLanguage = 'German';
        }


        getLabels({ language: this.textLanguage }).then(result => {
            result.forEach(element => {

                this.label[element.Name] = element[this.textLanguage + '__c'];
            });
        }).catch(error => {
        })

        this.template.querySelector('c-list-view-customer-portal').getLabelForTranslation(this.textLanguage);
    }

    ViewData(app) {
        try {

            let prevItem = [];
            let pendItem = [];
            let startDate;
            let endDate;
            let startTime;
            let endTime;
            let oneDigitNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

            app.forEach(element => {
                startDate = new Date(element.ArrivalWindowStartTime);
                   const date = new Date(startDate.toJSON().slice(0, 10));
                        const formattedDate = `${date.getDate()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                                    console.log(formattedDate);
                endDate = new Date(element.ArrivalWindowEndTime);
                if (oneDigitNumbers.includes(startDate.getMinutes())) {
                    startTime = `${startDate.getHours() - 5}:0${startDate.getMinutes()}`;
                }
                else {
                    startTime = `${startDate.getHours() - 5}:${startDate.getMinutes()}`;
                }

                if (oneDigitNumbers.includes(endDate.getMinutes())) {
                    endTime = `${endDate.getHours() - 5}:0${endDate.getMinutes()}`;
                }
                else {
                    endTime = `${endDate.getHours() - 5}:${endDate.getMinutes()}`;
                }

                if (element.Status == 'Completed' || element.Status == 'Cannot Complete') {

                    if (element.ServiceResources[0].Rating__c == undefined) {
                        prevItem.push({
                            Id: element.Id,
                            customerName: element.Account.Name,
                            status: element.Status,
                            date: formattedDate,
                            timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                            serviceType: element.WorkType.Name,
                            carPlate: element.Car_plate__c,
                            carModel: element.Car_brand_and_model__c,
                            carWasher: element.ServiceResources[0].ServiceResource.Name,
                            carYear: element.Car_Year__c,
                            rating: element.ServiceResources[0].Rating__c,
                            showRatingButton: true,
                            icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                        })
                    } else {
                        prevItem.push({
                            Id: element.Id,
                            customerName: element.Account.Name,
                            status: element.Status,
                            date: formattedDate,
                            timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                            serviceType: element.WorkType.Name,
                            carPlate: element.Car_plate__c,
                            carModel: element.Car_brand_and_model__c,
                            carYear: element.Car_Year__c,
                            carWasher: element.ServiceResources[0].ServiceResource.Name,
                            rating: element.ServiceResources[0].Rating__c,
                            showRatingButton: false,
                            icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                        })
                    }

                }
                else if (element.Status == 'Canceled') {
                    prevItem.push({
                        Id: element.Id,
                        customerName: element.Account.Name,
                        status: element.Status,
                        date: formattedDate,
                        timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                        serviceType: element.WorkType.Name,
                        carPlate: element.Car_plate__c,
                        carModel: element.Car_brand_and_model__c,
                        carYear: element.Car_Year__c,
                        showRatingButton: false,
                        icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                    });
                }
                else { //else of if where it checks for the status of booking

                    pendItem.push({
                        Id: element.Id,
                        customerName: element.Account.Name,
                        status: element.Status,
                        date: formattedDate,
                        timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                        serviceType: element.WorkType.Name,
                        carPlate: element.Car_plate__c,
                        carModel: element.Car_brand_and_model__c,
                        carYear: element.Car_Year__c,
                        carWasher: element.ServiceResources[0].ServiceResource.Name,
                        icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                    })
                }
            })


            this.oldBookings = prevItem;
            this.pendingBooking = pendItem;



        } catch (err) {


        }

    }

    handleStatus(event) {

        let statusval = event.target.value;
        if (statusval == 'All') {
            console.log(this.accountId);
            getAppointments({ accId: this.accountId }).then(app => {
                this.ViewData(app);
            })
                .catch(err => {


                })
        }
        else {
            applyFilter({ accId: this.accountId, status: statusval, serviceDate: 'null', serviceType: 'null', carYear: 'null' })

                .then(app => {
                    this.ViewData(app);

                })
                .catch(err => {


                })
        }
    }


    handleServiceType(event) {
        let servicetypeVal = event.target.value;
        if (servicetypeVal == 'All') {
            console.log(this.accountId);
            getAppointments({ accId: this.accountId }).then(app => {
                this.ViewData(app);
            })
                .catch(err => {


                })
        }
        else {
            applyFilter({ accId: this.accountId, status: 'null', serviceDate: 'null', serviceType: servicetypeVal, carYear: 'null' })

                .then(appointments => {
                    this.ViewData(appointments);

                }).catch(err => {


                })
        }

    }

    handledate(event) {
        let datval = event.target.value;
        applyFilter({ accId: this.accountId, status: 'null', serviceDate: datval, serviceType: 'null', carYear: 'null' }).then(appointments => {

            this.ViewData(appointments);

        }).catch(err => {


        })
    }

    handleCarYear(event) {
        let carYearval = event.target.value;
        if (carYearval == 'All') {
            getAppointments({ accId: this.accountId }).then(app => {

                this.ViewData(app);
            })
                .catch(err => {


                })
        }
        else {
            applyFilter({ accId: this.accountId, status: 'null', serviceDate: 'null', serviceType: 'null', carYear: carYearval }).then(appointments => {

                this.ViewData(appointments);

            }).catch(err => {


            })
        }
    }

    handleLogOut() {
        window.open("https://zawash.my.site.com/zaWash/secur/logout.jsp", "_self");
    }


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

    getSelectedQuoteData(event) {

        let selectedQuote;
        this.quotes.forEach(element => {
            if (element.Id == event.detail.value) {
                selectedQuote = element;
            }
        })
    }

    showMobileViewOptionBtns() {
        this.template.querySelector('.mobileViewOptionBtns').style.display = 'flex';
        this.template.querySelector('.mobileViewOptionBtnsOverlay').style.display = 'block';
    }

    hideMobileViewOptionBtns() {
        this.template.querySelector('.mobileViewOptionBtns').style.display = 'none';
        this.template.querySelector('.mobileViewOptionBtnsOverlay').style.display = 'none';
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

    showEmailField(event) {


        this.showEmailInputField = !event.target.checked;
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

    selectedDate;

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
                let clickedDate = new Date();
                clickedDate.setFullYear(parseInt(this.template.querySelector('.year').innerHTML));
                clickedDate.setMonth(parseInt(this.months.indexOf(this.template.querySelector('.month').innerHTML)));
                clickedDate.setDate(parseInt(event.target.innerHTML));
                this.selectedDate = clickedDate;    
                console.log('data', this.selectedDate, this.editRecordId, this.customerType, this.editDuration);

                getTimeSlots({ SelectedDate: clickedDate, workOrderId: this.editRecordId, cusType: this.customerType, Address: '', Duration: this.editDuration }).then(result => {
                    if (result == null || result == "" || result == undefined || result.length == 1) {
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
                    console.log('err', error);
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
                        submitForm({ LeadId: this.leadId, brand: this.template.querySelector('.carBrandModel').value, plate: this.template.querySelector('.colorPlateNumber').value, carYear: this.template.querySelector('.carYear').value, phoneNum: this.template.querySelector('.mobileNo').value }).then(result => {



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
                                submitForm({ LeadId: this.leadId, brand: this.template.querySelector('.carBrandModel').value, plate: this.template.querySelector('.colorPlateNumber').value, carYear: this.template.querySelector('.carYear').value, phoneNum: this.template.querySelector('.mobileNo').value }).then(result => {


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


    newSelectedTimeSlot;

    btnClicked(event) {
        this.template.querySelectorAll('.slot').forEach(element => {
            element.style.background = 'white';
            element.style.color = 'black';
        });
        event.target.style.background = '#187C29';
        event.target.style.color = 'white';
        this.selectedTimeSlot = event.target.innerHTML;
        this.newSelectedTimeSlot = event.target.innerHTML;


        this.carDetailsVisibility = true;
        this.template.querySelector('.goToPayment').style.display = 'block';
    }

    hideError(event) {
        if (!event.target.classList.contains('goToPayment')) {
            this.template.querySelector('.Error').style.display = 'none';
        }
    }

    handleCancel(event) {
        this.showSpinner = true;


        cancelAppointment({ serviceApptId: this.cancelBookingId }).then(res => {
            this.getappointments();
            this.showSpinner = false;
            this.confirmMessage = false;

        }).catch(error => {


        })
    }
    redirectToHomeSite() {
        window.location.replace(`https://zawash.my.site.com/zaWash/s/zawashb2b?language=${this.languagechange}&accId=${this.accountId}`);
    }


    getappointments() {
        console.log('accountId', this.accountId);
        getAppointments({ accId: this.accountId }).then(appointments => {
            try {

                let prevItem = [];
                let pendItem = [];
                let startDate;
                let endDate;
                let startTime;
                let endTime;
                let oneDigitNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
                appointments.forEach(element => {
                    startDate = new Date(element.ArrivalWindowStartTime);
                       const date = new Date(startDate.toJSON().slice(0, 10));
                        const formattedDate = `${date.getDate()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                                    console.log(formattedDate);
                    endDate = new Date(element.ArrivalWindowEndTime);
                    if (oneDigitNumbers.includes(startDate.getMinutes())) {
                        startTime = `${startDate.getHours() - 5}:0${startDate.getMinutes()}`;
                    }
                    else {
                        startTime = `${startDate.getHours() - 5}:${startDate.getMinutes()}`;
                    }

                    if (oneDigitNumbers.includes(endDate.getMinutes())) {
                        endTime = `${endDate.getHours() - 5}:0${endDate.getMinutes()}`;
                    }
                    else {
                        endTime = `${endDate.getHours() - 5}:${endDate.getMinutes()}`;
                    }

                    if (element.Status == 'Completed' || element.Status == 'Cannot Complete') {

                        if (element.ServiceResources[0].Rating__c == undefined) {
                            prevItem.push({
                                Id: element.Id,
                                quote: element.zaWash_Quote__r.Name,
                                customerName: element.Account.Name,
                                status: element.Status,
                                date: formattedDate,
                                timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                                serviceType: element.WorkType.Name,
                                carPlate: element.Car_plate__c,
                                carModel: element.Car_brand_and_model__c,
                                carWasher: element.ServiceResources[0].ServiceResource.Name,
                                carYear: element.Car_Year__c,
                                rating: ratingStars + '/ratingStar/0.gif',
                                showRatingButton: true,
                                icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                            })
                        } else {
                            prevItem.push({
                                Id: element.Id,
                                quote: element.zaWash_Quote__r.Name,
                                customerName: element.Account.Name,
                                status: element.Status,
                                date: formattedDate,
                                timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                                serviceType: element.WorkType.Name,
                                carPlate: element.Car_plate__c,
                                carModel: element.Car_brand_and_model__c,
                                carYear: element.Car_Year__c,
                                carWasher: element.ServiceResources[0].ServiceResource.Name,
                                rating: ratingStars + `/ratingStar/${element.ServiceResources[0].Rating__c}.gif`,
                                showRatingButton: false,
                                icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                            })
                        }

                    }
                    else if (element.Status == 'Canceled') {
                        prevItem.push({
                            Id: element.Id,
                            quote: element.zaWash_Quote__r.Name,
                            customerName: element.Account.Name,
                            status: element.Status,
                            date: formattedDate,
                            timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                            serviceType: element.WorkType.Name,
                            carPlate: element.Car_plate__c,
                            carModel: element.Car_brand_and_model__c,
                            carYear: element.Car_Year__c,
                            showRatingButton: false,
                            rating: ratingStars + '/ratingStar/0.gif',
                            icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                        });
                    }
                    else { //else of if where it checks for the status of booking

                        pendItem.push({
                            Id: element.Id,
                            quote: element.zaWash_Quote__r.Name,
                            customerName: element.Account.Name,
                            status: element.Status,
                            date: formattedDate,
                            timeSlot: `${element.startTime__c} - ${element.endTime__c}`,
                            serviceType: element.WorkType.Name,
                            carPlate: element.Car_plate__c,
                            carModel: element.Car_brand_and_model__c,
                            carYear: element.Car_Year__c,
                            carWasher: element.ServiceResources[0].ServiceResource.Name,
                            icon: '/zaWash/resource/1667381055000/Zawash' + element.WorkType.icon__c,
                        })
                    }
                });
                this.oldBookings = prevItem;
                this.pendingBooking = pendItem;
                console.log('oldAppointments', this.oldBookings);
                console.log('pendAppointments', this.pendingBooking);

            } catch (err) {
                console.log(err);
            }

        }).catch(err => {
            console.log(err);
        })

    }

}