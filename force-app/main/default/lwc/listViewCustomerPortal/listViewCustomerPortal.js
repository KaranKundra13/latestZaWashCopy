import { LightningElement, api,track } from 'lwc';
import viewInvoice from '@salesforce/apex/stripeIntegrationHepler.viewInvoice';
import {NavigationMixin} from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ListViewCustomerPortal extends NavigationMixin(LightningElement) {

    @api oldBookings;
    @api pendingBooking;
    @api textLanguage;
    @api getLabelsValue;
    @track invoiceAvail = false;

    dropdownOpened(event) { 
        let bigdiv = this.template.querySelector('[data-id="tab-default-1"]');
        let bigTop = bigdiv.getBoundingClientRect().y;
        let buttonTop = event.target.getBoundingClientRect().y;
        let dropdownTop = (buttonTop - bigTop) + event.target.getBoundingClientRect().height;
        let dropdownEle = event.currentTarget.children;
        dropdownEle.style.top = dropdownTop + 'px';
    }


    
    openRateModal(event) {
        let recordId = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('openaddrating', { detail: recordId }));
    }

    openInvoiceModal(event) {
        let recordId = event.currentTarget.dataset.id;
        let file;
        console.log('OUTPUT : ',recordId);
        viewInvoice({serviceAppointmentId :recordId})
              .then(result=>{
                file=result;
                if(file.length!=0){
              this.previewHandler(file.Id);
                }else{
                      const evt = new ShowToastEvent({
                    title: 'No Invoice',
                    message: 'No invoice found',
                    variant: 'info',
                });
                this.dispatchEvent(evt);
                }

              }).catch(error => {
                const evt = new ShowToastEvent({
                    title: 'No Invoice',
                    message: 'No invoice found',
                    variant: 'info',
                });
                this.dispatchEvent(evt);
              })
        
    }
    previewHandler(arg){
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url:`https://zawash.my.site.com/zaWash/servlet/servlet.FileDownload?file=${arg}`
            }
        })
    }

    openEditModal(event) {
        let recordId = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('openeditmodal', { detail: recordId }));
    }

    openCancelModel(event) {
        let recordId = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('opencancelmodal', { detail: recordId }));
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

}