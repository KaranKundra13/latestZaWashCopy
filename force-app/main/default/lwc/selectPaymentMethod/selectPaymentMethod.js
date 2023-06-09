import { LightningElement, api } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import cashInHand from '@salesforce/resourceUrl/cashInHand';


import SelectPaymentMetho from '@salesforce/label/c.SelectPaymentMethod'
import Card from '@salesforce/label/c.Card'
import BankTransfer from '@salesforce/label/c.BankTransfer'


export default class SelectPaymentMethod extends LightningElement {

    label={
        SelectPaymentMetho,
        Card,
        BankTransfer

    }
    cashImg = cashInHand + '/cashInHand.png';
    cardImg = icons + '/ZawashIcons/cardPayment.jpg';
    bankImg = icons + '/ZawashIcons/bankPayment.jpg';

    hidePayment()
    {
        const customEventVar = new CustomEvent('hidepayment', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar);
    }

    showCardPayment()
    {
        const customEventVar = new CustomEvent('showcardpayment', { detail: [true,false], bubbles: true });
        this.dispatchEvent(customEventVar);
    }
    showBankPayment()
    {
        const customEventVar = new CustomEvent('showbankpayment', { detail: [true,false], bubbles: true });
        this.dispatchEvent(customEventVar);
    }

}