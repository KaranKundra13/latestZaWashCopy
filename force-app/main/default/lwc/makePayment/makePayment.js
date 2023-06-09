import { LightningElement, track,api } from 'lwc';
import getServiceAppointment from '@salesforce/apex/stripeIntegrationHepler.getServiceAppointment';
import icons from '@salesforce/resourceUrl/Zawash';
import PayNow from '@salesforce/label/c.PayNow';
import thank_you from '@salesforce/label/c.thank_you';
import you_have_already_made_the_payment from '@salesforce/label/c.you_have_already_made_the_payment';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
export default class MakePayment extends LightningElement {
    finaldata = [];
    logo = icons + '/ZawashIcons/logo.png';
    iconlink;
    doblur = false;
    engOption;
    freOption;
    gerOption;
    currentcurrency='CHF';
    label = {
        PayNow,
        thank_you,
        you_have_already_made_the_payment
    };
    sendLang='';
    options=[];
    paymentSuccessful = false;
    connectedCallback() {
        var url_string = window.location.href;
        var url = new URL(url_string);
        var c = url.searchParams.get("id");
        var checkPay = url.searchParams.get("Payment_Status__c");
        let lang = url.searchParams.get("language");
        
        if(lang == 'en_US'){    
            this.sendLang = 'English';
            this.options=[];
            
                let temp = {
                    label : 'English',value:'en_US' 
                }
                this.options.push(temp);
                let temp2 = {
                    label : 'French',value:'fr_CH'
                }
                this.options.push(temp2);
                let temp3 = {
                    label : 'German',value:'de_CH'
                }
                this.options.push(temp3);
            
            
        }
        if(lang=='fr_CH'){
            this.sendLang = 'French';
            this.options=[];
            let temp2 = {
                label : 'French',value:'fr_CH'
            }
            this.options.push(temp2);
            let temp = {
                label : 'English',value:'en_US' 
            }
            this.options.push(temp);
            
            let temp3 = {
                label : 'German',value:'de_CH'
            }
            this.options.push(temp3);
        }
        if(lang=='fr'){
            this.sendLang = 'French';
            this.options=[];
            let temp2 = {
                label : 'French',value:'fr_CH'
            }
            this.options.push(temp2);
            let temp = {
                label : 'English',value:'en_US' 
            }
            this.options.push(temp);
            
            let temp3 = {
                label : 'German',value:'de_CH'
            }
            this.options.push(temp3);
        }
        if(lang=='de_CH'){
            this.sendLang = 'French';
            this.options=[];
            let temp3 = {
                label : 'German',value:'de_CH'
            }
            this.options.push(temp3);
            let temp2 = {
                label : 'French',value:'fr_CH'
            }
            this.options.push(temp2);
            let temp = {
                label : 'English',value:'en_US' 
            }
            this.options.push(temp);
            
            
            
        }
        this.SAid = c;

        if(checkPay == 'Paid'){
            this.paymentSuccessful = true;
        }
        console.log(this.sendLang);
        getServiceAppointment({ SAid: c ,language:this.sendLang})
            .then(result => {
                 if(result.payment_status=='Paid'){
                      this.paymentSuccessful = true;
                      
                    
                 }else{
                this.serviceAppoint = result;
                console.log('ServiceAppt', this.serviceAppoint);
                let keys = Object.keys(this.serviceAppoint);
                                this.currentcurrency=this.serviceAppoint.Currency__c;
     
                
                let temp2 = [];
                keys.forEach(element => {
                    if(element=='payment_status'){
                       return;
                    }
                    if(element != 'icon' ){
                        let temp = {};
                        temp = {key:element,value:this.serviceAppoint[element]};
                        temp2.push(temp);
                    }else{
                        this.iconlink='https://zawash.my.site.com/zaWash/resource/1667568188000/Zawash'+this.serviceAppoint[element];
                    }
                });
                this.finaldata= temp2;
            } 

            }).catch(error=>{
                console.log('OUTPUT : ',error);
            })
            

        }
    showPaymentComponent = false;
    doPayment(){
        this.showPaymentComponent = true;
        this.template.querySelector('.master').style.width='calc(100% - 470px)';
        this.doblur = true;
    }
    hidePaymentComp(){
        this.showPaymentComponent = false;
        this.template.querySelector('.master').style.width='100%';
        this.doblur = false;
    }
    textLanguage;
    
    languageChanged(event){
        if (event.target.value == 'en_US') {
            this.textLanguage = 'English';
            let url = new URL(window.location.href);
            let search_params = url.searchParams;
            search_params.set('language', 'en_US');
            url.search = search_params.toString();
            let new_url = url.toString();
            window.location.href = new_url;
        }
        if (event.target.value == 'fr_CH') {
            this.textLanguage = 'French';
            let url = new URL(window.location.href);
            let search_params = url.searchParams;
            search_params.set('language', 'fr_CH');
            url.search = search_params.toString();
            let new_url = url.toString();
            window.location.href = new_url;
        }
        if (event.target.value == 'de_CH') {
            this.textLanguage = 'German';
            let url = new URL(window.location.href);
            let search_params = url.searchParams;
            
            search_params.set('language', 'de_CH');
            url.search = search_params.toString();
            let new_url = url.toString();
            window.location.href = new_url;
        }
        
        
        
    }
}