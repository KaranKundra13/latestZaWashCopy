import { LightningElement, api, track } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import getSearchSuggetions from '@salesforce/apex/zawashHelperClass.getSearchSuggetions';
import getLatLngFromPlaceId from '@salesforce/apex/zawashHelperClass.getLatLngFromPlaceId';


export default class ZawashFontUI extends LightningElement {

    logo = icons + '/ZawashIcons/logo.png';
    searchIcon = icons + '/ZawashIcons/search.png';
    navigationIcon = icons + '/ZawashIcons/navigation.png';

    @api ourPartnerCarParks;
    @api enterYourStreet;

    @api bodyText;

    searchSuggestionResults = [];

    showzaWash(event) {
        this.template.querySelector('.noResult').style.display = 'none';
        if (event.target.value == "") {
            this.template.querySelector('.spanPlane').style.display = 'block';
            this.template.querySelector('.spanCross').style.display = 'none';
        }
        else {
            this.template.querySelector('.spanPlane').style.display = 'none';
            this.template.querySelector('.spanCross').style.display = 'block';
        }
        let targetValue = event.target.value;
        let searchPlace = targetValue.replaceAll(' ', '%20');
        getSearchSuggetions({ place: searchPlace }).then(result => {
            this.searchSuggestionResults = [];
            let myArray = [];
            result.forEach(element => {
                element = element.slice(1, -1);
                let splitElement = element.split('","');
                let locationName = splitElement[0];
                let placeId = splitElement[1];
                myArray.push({ key: locationName, value: placeId });
            });
            this.searchSuggestionResults = myArray;
            if (this.searchSuggestionResults.length == 0) {
                this.template.querySelector('.noResult').style.display = 'block';
            } else {
                this.template.querySelector('.noResult').style.display = 'none';
            }
        }).catch(error => {
        })
        if (event.target.value == '') {
            this.template.querySelector('.searchSuggestion').style.display = 'none';
        }
        else {
            this.template.querySelector('.searchSuggestion').style.display = 'block';
        }
    }

    @api currentSelectedAddress;

    suggetionSelected(event) {
        this.template.querySelector('.locationInput input').value = event.target.innerHTML;
        this.currentSelectedAddress = event.target.innerHTML;
        this.template.querySelector('.searchSuggestion').style.display = 'none';
        var splitedsearch = event.target.innerHTML.split(',');
        var country = splitedsearch[splitedsearch.length - 1];
        country = country.trim();
        getLatLngFromPlaceId({ placeId: event.target.dataset.placeid }).then(result => {
            let splitedResult = result.split(',');
            const customEventVar1 = new CustomEvent('setmapmarker', { detail: [splitedResult[0], splitedResult[1], country ,this.currentSelectedAddress], bubbles: true });
            this.dispatchEvent(customEventVar1);
        }).catch(error => {
        })
    }

    showSuggetions(event) {
        this.template.querySelector('.noResult').style.display = 'none';
        const customEventVar1 = new CustomEvent('hidezelectzawash', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar1);
        if (event.target.value != '') {
            this.template.querySelector('.searchSuggestion').style.display = 'block';
        }
    }

    @api hideEverything() {
        const customEventVar = new CustomEvent('hideeverything', { detail: true, bubbles: true });
        this.dispatchEvent(customEventVar);
        this.template.querySelector('.locationInput input').value = '';
        this.currentSelectedAddress = '';
        this.template.querySelector('.searchSuggestion').style.display = 'none';

        this.template.querySelector('.spanPlane').style.display = 'block';
        this.template.querySelector('.spanCross').style.display = 'none';
    }
    hideEveryComponent() {
        const customEventVar = new CustomEvent('hideeverything', { detail: true, bubbles: true });
        this.dispatchEvent(customEventVar);
    }

    refreshCurrentLocation() {
        const customEventVar = new CustomEvent('getcurrentlocation', { detail: true, bubbles: true });
        this.dispatchEvent(customEventVar);

    }

    @api resetComponentWidth() {
        this.template.querySelector('.articledata').style.width = '100%';
    }

    @api reduceComponentWidth() {
        this.template.querySelector('.articledata').style.width = 'calc(100% - 470px)';
    }
    @api setAddressSearchInputValue(address) {
        this.template.querySelector('.locationInput input').value = address;
        this.currentSelectedAddress = address;
        this.template.querySelector('.spanPlane').style.display = 'none';
        this.template.querySelector('.spanCross').style.display = 'block';
    }

    @api setAddressSearchInputValue1(address, latitude, longitude) {
        this.template.querySelector('.locationInput input').value = address;
        this.currentSelectedAddress = address;
        this.template.querySelector('.spanPlane').style.display = 'none';
        this.template.querySelector('.spanCross').style.display = 'block';

        this.template.querySelector('.searchSuggestion').style.display = 'none';
        var splitedsearch = address.split(',');
        var country = splitedsearch[splitedsearch.length - 1];
        country = country.trim();
        const customEventVar = new CustomEvent('resetmarker', { detail: [latitude, longitude, country], bubbles: true });
        this.dispatchEvent(customEventVar);
    }

}