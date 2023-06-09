import { LightningElement, api, track } from 'lwc';
import getServiceDetails from '@salesforce/apex/getSlots.getServiceDetails';
import getPaymentIntent from '@salesforce/apex/getSlots.getServiceAppointment';
import deleteAddons from '@salesforce/apex/getSlots.deleteAddons';
import createCoupon from '@salesforce/apex/StripeCoupon.createCoupon';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ApiKey from '@salesforce/apex/stripeIntegrationHepler.ApiKey';
import odooRefund from '@salesforce/apex/odooHelperClass.odooRefund';

export default class PaymentRefund extends LightningElement {
    @api recordId;
    @api invoiceid;


    @track showRefundDetails = false;
    @track noRefund = false;
    @track refundOrCouponScreen = true;
    @track serviceScreen = false;
    @track workTypeName;
    @track workTypePrice;
    @track addOns;
    @track Currency;
    @track serviceChoosen;


    // optionSelected(event) {
    //     let status = event.currentTarget.checked;
    //     this.template.querySelectorAll('.refundOrCouponScreen input').forEach(element => {
    //         element.checked = false;
    //     })
    //     event.currentTarget.checked = status;
    //     if (status == true) {
    //         this.serviceChoosen = event.currentTarget.parentElement.querySelector('p').innerHTML;
    //     }
    //     else {
    //         this.serviceChoosen = undefined;
    //     }
    // }

    nextScreen(event) {
        this.serviceChoosen = event.currentTarget.innerHTML;
        this.refundOrCouponScreen = false;
        this.serviceScreen = true;
        // if (this.serviceChoosen == undefined) {
        //     this.dispatchEvent(new ShowToastEvent({ variant: 'error', message: 'Please Select an option !' }));
        // }
        // else {
        //     this.refundOrCouponScreen = false;
        //     this.serviceScreen = true;
        // }
    }

    connectedCallback() {
        getServiceDetails({ ServiceAppointmentId: this.recordId }).then(result => {
            if (result.length > 0) {

                if (result[0].ServiceAppointments[0].Total_Price__c == result[0].ServiceAppointments[0].Refund_Amount__c || result[0].ServiceAppointments[0].Payment_Status__c == 'Unpaid') {
                    this.noRefund = true;
                }
                else {
                    this.invoiceid = result[0].ServiceAppointments[0].odooInvoiceId__c;
                    this.workTypeName = result[0].WorkType.Name;
                    this.workTypePrice = result[0].WorkType.Price__c;
                    this.Currency = result[0].WorkType.Currency__c;
                    this.addOns = result[0].CustomerOrders__r;
                    this.showRefundDetails = true;
                    ApiKey({ country: (result[0].ServiceAppointments[0].Street.split(',')[result[0].ServiceAppointments[0].Street.split(',').length - 1]).trim(), servicename: result[0].ServiceAppointments[0].WorkType.Name, curren: result[0].ServiceAppointments[0].Currency__c }).then(result => {
                        this.SkApiKey = result.Value__c;
                    })
                }
            }
        }).catch(error => {
        })
    }


    showAddons(event) {
        if (this.template.querySelector('.addOns').style.height == '0px') {
            this.template.querySelector('.addOns').style.height = 'max-content';
            event.currentTarget.iconName = 'utility:chevrondown';
            event.currentTarget.style.margin = '3px 20px 0px';
        }
        else {
            this.template.querySelector('.addOns').style.height = '0px';
            event.currentTarget.iconName = 'utility:chevronright';
            event.currentTarget.style.margin = '2px 20px 0px';
        }
    }

    mainServiceChoosen(event) {
        this.template.querySelectorAll('.addOns input').forEach(element => {
            element.checked = event.currentTarget.checked;
        });
        this.template.querySelector('.addOns').style.height = 'max-content';
        event.currentTarget.parentElement.querySelector('lightning-icon').iconName = 'utility:chevrondown';
        event.currentTarget.parentElement.querySelector('lightning-icon').style.margin = '3px 20px 0px';
    }

    addOnChoosen() {
        let allTrue = true;
        this.template.querySelectorAll('.addOns input').forEach(element => {
            if (element.checked == false) {
                allTrue = false;
            }
        });
        if (allTrue == false) {
            this.template.querySelector('.mainCheckbox').checked = allTrue;
        }
    }

    paymentIntent;
    SkApiKey;


    callRefundApi(refundType, amount) {
        if (this.serviceChoosen == 'Initiate Refund') {
            odooRefund({ invoiceid: this.invoiceid }).then(result => {
            })

            var requestOptions;
            if (refundType == 'FULL') {
                var urlencoded = new URLSearchParams();
                urlencoded.append("payment_intent", this.paymentIntent);
                requestOptions = {
                    method: 'POST',
                    headers: {
                        "Authorization": "Bearer " + this.SkApiKey,
                    },
                    redirect: 'follow',
                    body: urlencoded
                };
            }
            else {
                var urlencoded = new URLSearchParams();
                urlencoded.append("payment_intent", this.paymentIntent);
                urlencoded.append("amount", amount * 100);
                requestOptions = {
                    method: 'POST',
                    headers: {
                        "Authorization": "Bearer " + this.SkApiKey,
                    },
                    redirect: 'follow',
                    body: urlencoded
                };
            }
            fetch(`https://api.stripe.com/v1/refunds`, requestOptions)
                .then(response => response.text())
                .then(result => {
                    this.dispatchEvent(new ShowToastEvent({ variant: 'success', message: 'Refund successful !' }));
                    deleteAddons({ addOnsList: this.addOnsToRefund, ServiceAppointmentId: this.recordId, refundAmount: this.refundAmount, refundtype: refundType, serviceChoosen : this.serviceChoosen }).then(result => {
                        window.location.reload();
                    }).catch(error => {
                    })
                }).catch(error => {
                    this.dispatchEvent(new ShowToastEvent({ variant: 'error', message: 'Something went wrong !' }));
                });
        }
        else {
            if (this.serviceChoosen == 'Generate Credit Note') {
                createCoupon({ amountOff: parseFloat(this.refundAmount).toFixed(2) * 100, currency1: this.Currency, apiKey: this.SkApiKey }).then(result => {
                    this.dispatchEvent(new ShowToastEvent({ variant: 'success', message: 'Credit note Created !' }));
                    deleteAddons({ addOnsList: this.addOnsToRefund, ServiceAppointmentId: this.recordId, refundAmount: this.refundAmount , serviceChoosen : this.serviceChoosen }).then(result => {
                        window.location.reload();
                    }).catch(error => {
                    })
                }).catch(error => {
                })
            }
        }
    }


    addOnsToRefund = [];
    refundAmount;

    initiateRefund(event) {
        event.currentTarget.setAttribute("disabled", "");
        this.addOnsToRefund = [];
        this.refundAmount = 0;
        if (this.template.querySelector('.mainCheckbox').checked) {
            this.template.querySelectorAll('.addOns input').forEach(element => {
                this.addOnsToRefund.push(element.dataset.id);
                this.refundAmount = this.refundAmount + parseFloat(element.dataset.amount);
            })
            this.refundAmount = this.refundAmount + parseFloat(this.workTypePrice);
            if (this.paymentIntent == undefined) {
                getPaymentIntent({ apptId: this.recordId }).then(result => {
                    if (result != undefined) {
                        this.paymentIntent = result.Transaction__r.Payment_Id__c;
                    }
                    this.callRefundApi('FULL', 0);
                    // odooRefund({invoiceid:this.invoiceid}).then(result => {
                    // })
                }).catch(error => {
                })
            }
            else {
                this.callRefundApi('FULL', 0);
                // odooRefund({invoiceid:this.invoiceid}).then(result => {
                //     })
            }
        }
        else {
            let amount = 0;
            let noSelected = true;
            this.template.querySelectorAll('.addOns input').forEach(element => {
                if (element.checked) {
                    noSelected = false;
                    amount = amount + parseFloat(element.parentElement.querySelector('span').innerHTML);
                    this.addOnsToRefund.push(element.dataset.id);
                    this.refundAmount = this.refundAmount + parseFloat(element.dataset.amount);
                }
            })
            if (noSelected) {
                this.dispatchEvent(new ShowToastEvent({ variant: 'error', message: 'Please Select Atleast one Service to ' + this.serviceChoosen }));
                event.currentTarget.removeAttribute("disabled");
            }
            else {
                if (this.paymentIntent == undefined) {
                    getPaymentIntent({ apptId: this.recordId }).then(result => {
                        if (result != undefined) {
                            this.paymentIntent = result.Transaction__r.Payment_Id__c;
                        }
                        this.callRefundApi('PARTIAL', amount);
                        //     odooRefund({invoiceid:this.invoiceid}).then(result => {
                        // })
                    }).catch(error => {
                    })
                }
                else {
                    this.callRefundApi('PARTIAL', amount);
                    // odooRefund({invoiceid:this.invoiceid}).then(result => {
                    // })
                }
            }
        }

    }
}