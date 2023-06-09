import { api, LightningElement, track } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import createWorkOrder from '@salesforce/apex/getSlots.createWorkOrder';
import No_Partner_Parking_Is_Available from '@salesforce/label/c.No_Partner_Parking_Is_Available';
import getClosestServiceTerritory from '@salesforce/apex/zawashHelperClass.closestServiceTerritory';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
import getTravel from '@salesforce/apex/zawashHelperClass.getTravel';
export default class ServiceSpot extends LightningElement {
    No_Partner_Parking_Is_Available = No_Partner_Parking_Is_Available

    @track label = {
        spotServiceHome: "",
        serviceSpotParking: "",
        serviceSpotChoosing: "",
        Please_Select_a_Partner_Car_Parks: "",
        Submit: "",
        Free_Transport: "",
        Next: "",
        No_Partner_Parking_Is_Available
    }

    @api textLanguage;

    connectedCallback() {
        getLabels({ language: this.textLanguage }).then(result => {
            result.forEach(element => {
                this.label[element.Name] = element[this.textLanguage + '__c'];
            });
        }).catch(error => {
        })
    }

    svgURL = icons + '/ZawashIcons/shop.svg';
    AtHomeIcon = icons + '/ZawashIcons/adomicile.png';
    partnerCarParkIcon = icons + '/ZawashIcons/ParkingPartenaire.png';
    navigationIcon = icons + '/ZawashIcons/navigation.png';

    subTotalCost;
    @api subTotalMiniComponentValues(subTotalMiniComponentCost) {
        this.subTotalCost = subTotalMiniComponentCost;
        this.template.querySelector('.subTotalMiniComponent').style.display = 'block';
    }
    hideServiceSpot() {
        const customEventVar = new CustomEvent('hideservicespot', { detail: false, bubbles: true });
        this.dispatchEvent(customEventVar);
        const customEventVar1 = new CustomEvent('resetmarker', { detail: true, bubbles: true });
        this.dispatchEvent(customEventVar1);
    }

    travel;
    travelCost;
    currency;
    country;
    address;
    customerType;

    @api setValuesForCreateWorkOrder(leadId, service, paymentMode, searchPlaceLatitude, searchPlaceLongitude, travel, currency, serviceId, country, realcountry, currentSelectedAddress, customerType) {
        this.leadId = leadId;
        this.service = service;
        this.serviceId = serviceId;
        this.paymentMode = paymentMode;
        this.searchPlaceLatitude = searchPlaceLatitude;
        this.searchPlaceLongitude = searchPlaceLongitude;
        this.currency = currency;
        this.travel = travel;
        this.country = realcountry;
        this.address = currentSelectedAddress;
        this.customerType = customerType;

        if (travel == undefined) {
            getTravel({ Country: country, Curr: currency }).then(result => {
                this.travelCost = result.Price__c;
            })
        }
        else {

            this.travelCost = this.travel[0].Price__c;
        }
    }
    workOrderID;
    leadId;
    service;
    serviceId;
    paymentMode;
    thereareTerritories = false;
    closestServiceTerritory;
    searchPlaceLatitude;
    searchPlaceLongitude;
    proceedToAppointmentBooking(event) {

        if (event.target.dataset.name == 'AtHome') {
            this.template.querySelector('.loader').style.display = 'block';

            createWorkOrder({ leadId: this.leadId, serviceId: this.serviceId, paymentMode: this.paymentMode, customerType: this.customerType, selectedCurrency: this.currency, Travel: true }).then(result => {
                this.workOrderID = result;
                this.template.querySelector('.loader').style.display = 'none';
                const customEventVar = new CustomEvent('resetmarker', { detail: true, bubbles: true });
                this.dispatchEvent(customEventVar);
                const customEventVar1 = new CustomEvent('proceedtoappointmentbooking', { detail: [true, this.workOrderID, this.address], bubbles: true });
                this.dispatchEvent(customEventVar1);
                this.template.querySelector('.closestServiceTerritory').style.display = 'none';
            }).catch(error => {
                this.template.querySelector('.loader').style.display = 'none';
            })
        }
        else {
            if (event.target.dataset.name == 'partnerCarPark') {
                this.template.querySelector('.loader').style.display = 'block';
                getClosestServiceTerritory({
                    userlongitude: this.searchPlaceLongitude, userlatitude
                        : this.searchPlaceLatitude, country: this.country
                }).then(result => {
                    this.closestServiceTerritory = result;
                    if (this.closestServiceTerritory.length > 0) {
                        this.closestServiceTerritory.forEach(element => {
                            let jsonData = element.Address;
                            element.Address = undefined;
                            this.thereareTerritories = true;
                            for (let index = 0; index < Object.values(jsonData).length - 1; index++) {
                                console.log('Object.values(jsonData)[index] : ',Object.values(jsonData)[index]);
                                if (element.Address == undefined) {
                                    element.Address = Object.values(jsonData)[index];
                                    
                                }
                                else {
                                    element.Address = element.Address + ', ' + Object.values(jsonData)[index];
                                }
                                console.log('lement.Address : ',element.Address);
                                                let addressArr = element.Address.split(","); // split the address string into an array of its parts
                            if (addressArr.length >= 4) { // check if there are enough parts to swap
                                const temp = addressArr[1]; // save the element to be swapped
                                addressArr[1] = addressArr[2]; // set the element at index 1 to the element at index 2
                                addressArr[2] = temp; // set the element at index 2 to the saved element
                            }
                            element.Address = addressArr.join(","); // join the array back into a string
                            }
                        });
                        this.template.querySelector('.loader').style.display = 'none';
                        this.template.querySelector('.closestServiceTerritory').style.display = 'block';
                    } else {
                        var arr = [];
                        arr.push(this.No_Partner_Parking_Is_Available);
                        this.closestServiceTerritory = arr;
                        this.template.querySelector('.loader').style.display = 'none';
                        this.template.querySelector('.closestServiceTerritory').style.display = 'block';
                    }
                }).catch(error => {
                    var arr = [];
                    arr.push(this.No_Partner_Parking_Is_Available);
                    this.closestServiceTerritory = arr;
                    this.template.querySelector('.loader').style.display = 'none';
                    this.template.querySelector('.closestServiceTerritory').style.display = 'block';
                })
            }
        }
    }

    serviceTeritorySelected;
    serviceTeritorySelectedName;
    serviceTeritoryChoosed(event) {
        this.template.querySelectorAll('.serviceTeritory').forEach(element => {
            element.style.border = '1px solid rgb(200, 200, 200)'
        });
        switch (event.target.nodeName) {
            case 'DIV':
                event.target.style.border = '1px solid #187C29';
                break;
            case 'LIGHTNING-ICON':
                event.target.parentElement.style.border = '1px solid #187C29';
                break;
            case 'P':
                event.target.parentElement.parentElement.style.border = '1px solid #187C29';
                break;
            case 'SPAN':
                event.target.parentElement.style.border = '1px solid #187C29';
                break;
        }

        this.serviceTeritoryLatitude = event.target.dataset.lat;
        this.serviceTeritoryLongitude = event.target.dataset.lng;
        this.serviceTeritorySelected = event.target.dataset.id;
        this.serviceTeritorySelectedName = event.target.dataset.name;
        this.address = event.target.dataset.add;

        const customEventVar1 = new CustomEvent('setroute', { detail: [this.serviceTeritoryLatitude, this.serviceTeritoryLongitude, this.address], bubbles: true });
        this.dispatchEvent(customEventVar1);
        this.template.querySelector('.serviceTritoryBottom').style.display = 'flex';
    }

    submitTeritory() {
        this.template.querySelector('.loader').style.display = 'block';


        createWorkOrder({ leadId: this.leadId, serviceId: this.serviceId, paymentMode: this.paymentMode, territoryId: this.serviceTeritorySelected, customerType: this.customerType, selectedCurrency: this.currency, Travel: false }).then(result => {
            this.workOrderID = result;
            this.template.querySelector('.loader').style.display = 'none';
            const customEventVar1 = new CustomEvent('proceedtoappointmentbooking', { detail: [true, this.workOrderID, this.address], bubbles: true });
            this.dispatchEvent(customEventVar1);
        }).catch(error => {
            this.template.querySelector('.loader').style.display = 'none';
        })
    }
}