import { LightningElement, api, wire } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import servicesList from '@salesforce/apex/zawashHelperClass.getworkTypeGroups';

export default class ChooseYourService extends LightningElement {

    paymentMode;
    services;
    serviceChoose = '';
    divstylechoose = '';
    styleArr = [];



    @api hideOrShowComponent(action) {
        if (action == 'show') {
            this.template.querySelector('.services').style.top = 'calc(100vh - 350px)';
        }
        if (action == 'hide') {
            this.template.querySelector('.services').style.top = '100vh';
        }
        if (action == 'showb2b') {
            this.template.querySelector('.servicesb2b').style.top = 'calc(100vh - 350px)';
        }
        if (action == 'hideb2b') {
            this.template.querySelector('.servicesb2b').style.top = '100vh';
        }
    }

    @api setPaymentMethodChoosenToServiceChooseSection(paymentModeChoosen, customerType, currentLanguage, selectedCurrency) {
        this.paymentMode = paymentModeChoosen;
        servicesList({ iconLink: icons, paymentMode: this.paymentMode, businessCategory: customerType, country: currentLanguage, curr: selectedCurrency }).then(result => {
            if (customerType == 'requestQuote' && !this.styleArr.includes('servicesb2b')) {
                this.styleArr = ['servicesb2b'];
                this.setMainStyle();
            } else if (!this.styleArr.includes('services') && !this.styleArr.includes('servicesb2b')) {
                this.styleArr = ['services'];
                this.setMainStyle();
            }
            this.services = result;
        }).catch(error => {
            throw error;

        })
    }

    @api setChooseYourServiceValue(value) {
        this.serviceChoose = value;
    }

    @api setzawashComponentWidth() {
        if (window.innerWidth <= 400) {
            this.styleArr = ['services'];
            this.setMainStyle();
            return;
        }
        if (this.styleArr[0].includes('b2b')) {
            this.styleArr.push('shiftserviceb2b');
        } else {
            this.styleArr.push('shiftservices');
        }

        this.setMainStyle();
    }

    @api resetComponentWidth() {
        if (window.innerWidth <= 400) {
        }
        else {
            this.styleArr.pop();
            this.setMainStyle();
        }
    }

    setMainStyle() {
        this.divstylechoose = this.styleArr.join(' ');
    }

    @api showLoader() {
        this.template.querySelector('.loader').style.display = 'block';
    }

    @api hideLoader() {
        this.template.querySelector('.loader').style.display = 'none';
    }

    @api resetBorder() {
    }

    proceedToServiceCart(event) {
        const proceedToSelectExtraServices = new CustomEvent('selectextraservices', { detail: [true, event.target.dataset.name, event.target.dataset.price, event.target.dataset.estimation, event.target.dataset.icon, event.target.dataset.id, event.target.dataset.description, event.target.dataset.currency], bubbles: true });
        this.dispatchEvent(proceedToSelectExtraServices);
    }
}