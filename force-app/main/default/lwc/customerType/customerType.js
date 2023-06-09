import { LightningElement } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
export default class CustomerType extends LightningElement {

    QuoteIcon = icons + '/ZawashIcons/quote.jpg';
    bookNowIcon = icons + '/ZawashIcons/bookNow.jpg';

    chooseYourZawash(event)
    {
        const customEventVar = new CustomEvent('showselectyourzawash', { detail: [true,event.target.dataset.name], bubbles: true });
        this.dispatchEvent(customEventVar);
    }
}