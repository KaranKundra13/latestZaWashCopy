import { LightningElement, api } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';

import SelectSubscriptionPlan from '@salesforce/label/c.SelectSubscriptionPlan'
export default class SubscriptionCard extends LightningElement {

   label={
      SelectSubscriptionPlan,
   }

    threemonth = icons + '/ZawashIcons/3month.jpg';
    sixmonth = icons + '/ZawashIcons/6month.jpg';
    ninemonth = icons + '/ZawashIcons/9month.jpg';
    twelvemonth = icons + '/ZawashIcons/12month.jpg';
    customize=false;

    hidePayment()
    {
        const customEventVar = new CustomEvent('hidepayment', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar);
    }

    paymentPrice;

    @api setPaymentPrice(paymentPrice) {
      this.paymentPrice = paymentPrice;
    }

    customizeSub(){
       
        this.customize=! this.customize;
    }
    showPaymentOptions(event)
    {
        const customEventVar = new CustomEvent('showpaymentoptions', { detail: [true,event.target.dataset.name], bubbles: true });
        this.dispatchEvent(customEventVar);
    }

    paypermonth;
    showpaypermonth(event)
    {
     var val= event.target.value;
     var val2=parseInt(event.target.value);

     if(val==='0'||val==='3'||val==='6'||val==='9'||val==='12'||val2>12){
        event.target.value='';
        this.paypermonth='';
        return;
     }
     if(val==='2'){
        this.paypermonth='118/month';
     }
     else if(val==='4'||val==='5'){
        this.paypermonth='106/month';
     }
     else if(val==='7'||val==='8'){
        this.paypermonth='95/month';
     }
     else if(val==='10'||val==='11'){
        this.paypermonth='85/month';
     }
     
    }

   
}