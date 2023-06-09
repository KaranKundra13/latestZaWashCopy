import { LightningElement, track, api } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import getCharges from '@salesforce/apex/zawashHelperClass.getCharges';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
export default class ServiceCart extends LightningElement {

    extraServices;
    serviceImage;
    errorVisibility = false;
    addBtnVisibility = true;
    customerType;
    errorServiceCount;
    currentCurrency;
    numbersOfCars;
    addonsSelected = [];
    totalTimeTakenInService;

    toolTipIcon = icons + '/ZawashIcons/tooltip.png';

    @track label = {
        Close: "",
        Extras: "",
        Add: "",
        Sorry: "",
        you_have_to_select_atleast: "",
        main_service: ""
    };

    travel;
    @api textLanguage;

    connectedCallback() {

        getLabels({ language: this.textLanguage }).then(result => {
            result.forEach(element => {
                this.label[element.Name] = element[this.textLanguage + '__c'];
            });
        }).catch(error => {
        })
    }

    serviceEstimatedTime;

    @api setComponentDetails(serviceName, imageLink, servicePrice, serviceEstimatedTime, description) {
        this.template.querySelector('.serviceName').innerHTML = serviceName;
        this.serviceImage = imageLink;
        this.serviceEstimatedTime = serviceEstimatedTime;
        if(servicePrice.includes(".")){
this.template.querySelector('.servicePrice').innerHTML = servicePrice+'.00';
        }else{
            this.template.querySelector('.servicePrice').innerHTML = servicePrice;
        }
        
        this.template.querySelector('.totalCost').innerHTML = parseFloat(servicePrice).toFixed(2);
        this.template.querySelector('.serviceEstimatedTime').innerHTML = serviceEstimatedTime+' ';
        this.template.querySelector('.tooltipContent').innerHTML = description.replaceAll("\n", "<br/>");
    }
    @api getExtraServicesList(paymentMode, service, currentLanguage, selectedCurrency) {

        getCharges({ paymentMode: paymentMode, serviceId: service, iconLink: icons, businessCategory: this.customerType, country: currentLanguage, curr: selectedCurrency }).then(result => {
            this.extraServices = result;
            let travelIndex;
            for (let index = 0; index < this.extraServices.length; index++) {
                if (this.extraServices[index].English__c == 'Travel') {
                    travelIndex = index;
                }
            }
            for (let index = 0; index < this.extraServices.length; index++) {
                console.log('prices : ',this.extraServices[index].Price__c);
                if (!(String(this.extraServices[index].Price__c).includes(".")||(String(this.extraServices[index].Price__c).includes(",")))) {
                    this.extraServices[index].Price__c=String(this.extraServices[index].Price__c)+'.00';
                }
            }

            if (travelIndex != undefined) {
                this.travel = this.extraServices.splice(travelIndex, 1);
            }

            if (this.extraServices != undefined) {
                this.currentCurrency = this.extraServices[0].Currency__c;
            }
        }).catch(error => {
        })
    }


    hideServiceCart() {
        const customEventVar = new CustomEvent('hideservicecart', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar);
    }

    @api setCustomerType(customerType, numbersOfCars) {
        this.customerType = customerType;
        this.numbersOfCars = numbersOfCars;
        if (this.customerType == 'requestQuote') {
            this.template.querySelector('.mainProductCounter').innerHTML = this.numbersOfCars;
        }
    }

    increaseProductCount(event) {


        if (event.target.parentElement.querySelector('.productCount').innerHTML < 1) {
            this.addBtnVisibility = true;
            this.template.querySelector('.totalCost').innerHTML = (parseFloat(this.template.querySelector('.totalCost').innerHTML) + parseFloat(event.target.parentElement.parentElement.querySelector('.serviceCost').innerHTML)).toFixed(2);

            event.target.parentElement.querySelector('.productCount').innerHTML = parseInt(event.target.parentElement.querySelector('.productCount').innerHTML) + 1;
        }
    }

    decreaseProductCount(event) {
        if (!(event.target.classList.contains('mainMinusIcon'))) {
            if (event.target.parentElement.querySelector('.productCount').innerHTML > 0) {
                this.template.querySelector('.totalCost').innerHTML = (parseFloat(this.template.querySelector('.totalCost').innerHTML) - parseFloat(event.target.parentElement.parentElement.querySelector('.serviceCost').innerHTML)).toFixed(2);

                event.target.parentElement.querySelector('.productCount').innerHTML = parseInt(event.target.parentElement.querySelector('.productCount').innerHTML) - 1;
            }
        }
    }

    showSubTotalMiniComponent() {

        var addonsSelected = [];
        this.totalTimeTakenInService = this.serviceEstimatedTime * parseInt(this.template.querySelector('.mainProductCounter').innerHTML);
        this.template.querySelectorAll('.addOnsCount').forEach(element => {
            if (parseInt(element.innerHTML) > 0) {
                let dataJson = {
                    Id: element.dataset.id,
                    Name: element.parentElement.parentElement.querySelector('.productName').innerHTML,
                    Quantity: parseInt(element.innerHTML),
                    Price: parseFloat(parseFloat(element.parentElement.parentElement.querySelector('.serviceCost').innerHTML))
                };
                addonsSelected.push(dataJson);
                this.totalTimeTakenInService = this.totalTimeTakenInService + (parseInt(element.innerHTML) * parseInt(element.parentElement.parentElement.querySelector('.extraServiceTimeEstimate').innerHTML.split(' ')[0]));

            }
        });


        if (this.customerType == 'requestQuote') {
            this.errorServiceCount = 'three';
            if (parseInt(this.template.querySelector('.mainProductCounter').innerHTML) < 3) {
                this.template.querySelector('.error').style.display = 'block';
                this.template.querySelector('.error1').style.display = 'block';
                this.template.querySelector('.error2').style.display = 'none';
            }
            else {
                if (parseFloat(this.template.querySelector('.totalCost').innerHTML) <= 0) {
                    this.template.querySelector('.error').style.display = 'block';
                    this.template.querySelector('.error1').style.display = 'none';
                    this.template.querySelector('.error2').style.display = 'block';
                }
                else {
                    const customEventVar1 = new CustomEvent('hidecartandshowsubtotalcomponent', { detail: [true, (parseFloat(this.template.querySelector('.totalCost').innerHTML)).toFixed(2), this.currentCurrency, addonsSelected, this.travel, 60], bubbles: true });
                    this.dispatchEvent(customEventVar1);
                }
            }
        }
        else {
            if (this.customerType == 'bookNow') {
                this.errorServiceCount = 'one';
                if (parseInt(this.template.querySelector('.mainProductCounter').innerHTML) == 0) {
                    this.template.querySelector('.error').style.display = 'block';
                    this.template.querySelector('.error1').style.display = 'block';
                    this.template.querySelector('.error2').style.display = 'none';
                }
                else {
                    const customEventVar1 = new CustomEvent('hidecartandshowsubtotalcomponent', { detail: [true, (parseFloat(this.template.querySelector('.totalCost').innerHTML)).toFixed(2), this.currentCurrency, addonsSelected, this.travel, this.totalTimeTakenInService], bubbles: true });
                    this.dispatchEvent(customEventVar1);
                }
            }
        }
    }
    hideError(event) {
        if (!event.target.classList.contains('addBtnDiv') && !event.target.classList.contains('addBtn') && !event.target.classList.contains('totalCost')) {
            this.template.querySelector('.error').style.display = 'none';
        }
    }
}