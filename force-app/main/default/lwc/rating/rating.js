import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import submitRating from '@salesforce/apex/getSlots.submitRating';
import Submit from '@salesforce/label/c.Submit';
import Cancel from '@salesforce/label/c.Cancel';
import How_much_do_you_rate_our_service from '@salesforce/label/c.How_much_do_you_rate_our_service';
import How_much_do_you_rate_our_executive from '@salesforce/label/c.How_much_do_you_rate_our_executive';
import Share_your_Feedback from '@salesforce/label/c.Share_your_Feedback';
import Error from '@salesforce/label/c.Error';
import Please_Select_Rating_before_submit from '@salesforce/label/c.Please_Select_Rating_before_submit';
import Success_Your_feedback_has_been_recorded from '@salesforce/label/c.Success_Your_feedback_has_been_recorded';
import Tell_us_more_about_your_experience from '@salesforce/label/c.Tell_us_more_about_your_experience';

export default class Rating extends LightningElement {

    label = {
        Submit,
        Cancel,
        How_much_do_you_rate_our_service,
        How_much_do_you_rate_our_executive,
        Share_your_Feedback, Error,
        Please_Select_Rating_before_submit,
        Tell_us_more_about_your_experience
    };

    @track thankYouPageVisibility = false;
    @track feedbackPageVisibility = true;

    serviceRating;
    washerRating;

    serviceRatingChanged(event) {
        event.target.parentElement.querySelectorAll('label').forEach(element => {
            element.style.color = '#ccc';
        });
        event.target.parentElement.querySelectorAll('label').forEach(element => {
            if (element.dataset.value <= event.target.dataset.value) {
                element.style.color = 'green';
            }
        });
        this.serviceRating = event.target.dataset.value;
    }

    washerRatingChanged(event) {
        event.target.parentElement.querySelectorAll('label').forEach(element => {
            element.style.color = '#ccc';
        });
        event.target.parentElement.querySelectorAll('label').forEach(element => {
            if (element.dataset.value <= event.target.dataset.value) {
                element.style.color = 'green';
            }
        });
        this.washerRating = event.target.dataset.value;
    }

    submitRating() {


        if (this.serviceRating == undefined || this.washerRating == undefined) {
            this.template.querySelector('.Error').style.display = 'block';
            this.template.querySelector('.ErrorMsg').innerHTML = Please_Select_Rating_before_submit;
            setTimeout(() => { this.template.querySelector('.Error').style.display = 'none'; }, 3000);
        }
        else {
            submitRating({ rate: this.washerRating, woId: this.woId }).then(result => {
                const customEvent = new ShowToastEvent({
                    title: Success_Your_feedback_has_been_recorded,
                    variant: 'Success'
                });
                this.dispatchEvent(customEvent);
                console.log(feedPage, this.feedbackPageVisibility);
                console.log(thanksPage, this.thankYouPageVisibility);
                this.feedbackPageVisibility = false;
                this.thankYouPageVisibility = true;
            }).catch(error => {
            })
        }
    }

    setSelectValueCount = 0;
    currentLanguage;
    woId;

    renderedCallback() {
        if (this.setSelectValueCount == 0) {
            let currentURL = window.location.href;


            let allPerameters = currentURL.split('?')[1].split('&');

            let elementFoundAndChanged = false;
            allPerameters.forEach(element => {
                if (element.split('=')[0] == 'language') {
                    // this.template.querySelector('select').value = element.split('=')[1];
                    if (element.split('=')[1] == 'en_US') {
                        this.currentLanguage = 'USA';
                        elementFoundAndChanged = true;
                    }
                    else {
                        if (element.split('=')[1] == 'fr_CH') {
                            this.currentLanguage = 'Switzerland';
                            elementFoundAndChanged = true;
                        }
                        else {
                            if (element.split('=')[1] == 'de_CH') {
                                this.currentLanguage = 'Germany';
                                elementFoundAndChanged = true;
                            }
                        }
                    }
                }
                if (element.split('=')[0] == 'wid') {
                    this.woId = element.split('=')[1];
                }


                if (elementFoundAndChanged == false) {
                    window.location.href = currentURL.split('?')[0] + '?language=en_US&' + currentURL.split('?')[1];
                }
            });

            this.setSelectValueCount++;

        }
    }

}