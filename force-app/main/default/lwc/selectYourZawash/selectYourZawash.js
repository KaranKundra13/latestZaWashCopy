import { LightningElement, api } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import SelectYourZaWash from '@salesforce/label/c.Select_your_zaWash';
import Subscription from '@salesforce/label/c.Subscription';
import OneTime from '@salesforce/label/c.One_Time';
import ViewOptions from '@salesforce/label/c.View_Options';
export default class SelectYourZawash extends LightningElement {

    SubscriptionIcon = icons + '/ZawashIcons/Abonnements.png';
    atHomeIcon = icons + '/ZawashIcons/adomicile.png';

    label = {
        SelectYourZaWash,
        Subscription,
        OneTime,
        ViewOptions
    };

    @api resetComponentWidth() {
        if (window.innerWidth <= 400) {
            this.template.querySelector('.selectZawash').style.left = '5%';
        }
        else {
            this.template.querySelector('.selectZawash').style.left = 'calc(50% - 200px)';
        }
        this.template.querySelectorAll('.zaWashOptions').forEach(element => {
            element.style.border = '1px solid rgb(209, 209, 209)';
        });
    }

    @api setzawashComponentWidth() {
        this.template.querySelector('.selectZawash').style.left = 'calc(50% - 435px)';
    }

    showChooseServices(event) {
        this.template.querySelectorAll('.zaWashOptions').forEach(element => {
            element.style.border = '1px solid rgb(209, 209, 209)';
        });
        switch (event.target.nodeName) {
            case 'DIV':
                event.target.style.border = '2px solid green';
                break;
            case 'IMG':
                event.target.parentElement.style.border = '2px solid green';
                break;
            case 'H2':
                event.target.parentElement.style.border = '2px solid green';
                break;
            case 'H3':
                event.target.parentElement.style.border = '2px solid green';
                break;
        }
        const customEventVar = new CustomEvent('showchooseservice', { detail: [true, event.target.dataset.name], bubbles: true });
        this.dispatchEvent(customEventVar);
    }
    hideZaWash() {
        const customEventVar = new CustomEvent('hidezawash', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar);
    }

}