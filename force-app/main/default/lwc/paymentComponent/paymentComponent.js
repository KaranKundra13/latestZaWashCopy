import { LightningElement, api, track } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import SelectPaymentMetho from '@salesforce/label/c.SelectPaymentMethod'
import Card from '@salesforce/label/c.Card'
import iBAN from '@salesforce/label/c.iBAN'
import Thank_You_for from '@salesforce/label/c.Thank_You_for';
import odooCustomer from '@salesforce/apex/odooHelperClass.odooCustomer';
import odooInvoice from '@salesforce/apex/odooHelperClass.odooInvoice';
import createPayment from '@salesforce/apex/stripeIntegrationHepler.createPayment';
import selectPaymentMethod from '@salesforce/apex/stripeIntegrationHepler.selectPaymentMethod';
import selectLeadId from '@salesforce/apex/stripeIntegrationHepler.selectLeadId';
import invoicePdfmethod from '@salesforce/apex/getSlots.invoicePdfmethod'


export default class SelectPaymentMethod extends LightningElement {
    methodToggle='link'
    SAid;
    serviceAppoint;
    @track currLeadId;
    currWoId;
    country;
    currentcurrency='CHF';
    accId;
    @api textLanguage;
    connectedCallback() {
        var url_string = window.location.href;
        var url = new URL(url_string);
        var c = url.searchParams.get("id");
        this.SAid = c;
        selectPaymentMethod({ SAid: c })
            .then(result => {
                this.serviceAppoint = result;
                var country=this.serviceAppoint.Address.street;
                var countrysplit=country.split(',').reverse();
                this.country=countrysplit[0];  
                this.currWoId=this.serviceAppoint.ParentRecordId;
            })
           
            selectLeadId({ SAid: c })
            .then(result => {
                this.currLeadId = result;
                this.accId=result;
            })

    }


    
    label = {
        SelectPaymentMetho,
        Card,
        iBAN,
        Thank_You_for

    }
    @track showIbnComp = false;
    @track showCardPaymentComp = false;
    @track hideCash = true;
    cashImg = icons + '/ZawashIcons/cashInPayment.jpg';
    cardImg = icons + '/ZawashIcons/cardPayment.jpg';
    bankImg = icons + '/ZawashIcons/bankPayment.jpg';

    hidePayment() {
        const customEventVar = new CustomEvent('hidepayment', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar);
    }
    hideCardpay() {
        this.showCardPaymentComp = false;
        this.hideCash = true;
        this.showIBnComp = true;
        this.template.querySelector('.progress').style.width='100%';
                                const myTimeout = setTimeout(this.reload(), 5000);

    }
    completeMainComp(){
        this.showIBnComp = true;
        
        this.showCardPaymentComp = false;
        this.hideCash = false;
        this.template.querySelector('.progress').style.width='100%';
                                const myTimeout = setTimeout(this.reload(), 5000);

    }
    showCardPayment() {
        
        const customEventVar = new CustomEvent('showcardpayment', { detail: [true, false], bubbles: true });
        this.dispatchEvent(customEventVar);
        this.hideCash = false;
        this.showIBnComp = false;
        this.showCardPaymentComp = true;
        
    }
    showIBan() {
        this.showIBnComp = true;
        this.template.querySelector('.progress').style.width='100%';
        this.showCardPaymentComp = false;
        this.hideCash = false;

        let transId = '';
        odooCustomer({ lId: this.accId })
            .then((res) => {
                createPayment({ paymentId: 'Id of the stripe Payment', customerID: this.accId, status: 'In Progress', amount: String(parseFloat(this.serviceAppoint.Total_Price__c)*100), odooCustomerId: res, workorderId: this.serviceAppoint.ParentRecordId, methodToggle:this.methodToggle,serviceAppointmentId:this.SAid,Qwantity:'1',currentCurrency:this.currentcurrency})
                    .then((resu) => {
                        transId = resu;
                        var lis = [];
                         lis.push(this.SAid);
                         invoicePdfmethod({ recordIds: lis })
                         .then(result=>{
                        odooInvoice({ TId: transId })
                            .then((result) => {
                            })
                            .catch((error) => {
                            });
                        })

                    })
                    .catch((error) => {
                    });
            })
            .catch((err) => {
            });
                        const myTimeout = setTimeout(this.reload(), 5000);
this.template.querySelector('.progress').style.width='100%';
    }
    
   reload(){
       window.location.reload();
   }

}