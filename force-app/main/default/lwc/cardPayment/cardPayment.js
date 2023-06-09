import { LightningElement, track, api, wire } from "lwc";
import { Card } from "./card";
import { Payment } from "./payment";
import sendTime from '@salesforce/apex/getSlots.sendTime';
import icons from '@salesforce/resourceUrl/Zawash';
import invoicePdfmethod from '@salesforce/apex/getSlots.invoicePdfmethod'
import createSubscription from '@salesforce/apex/stripeIntegrationHepler.createSubscription'
import ApiKey from '@salesforce/apex/stripeIntegrationHepler.ApiKey'
import customer from '@salesforce/apex/stripeIntegrationHepler.customer'
import odooCustomer from '@salesforce/apex/odooHelperClass.odooCustomer'
import odooInvoice from '@salesforce/apex/odooHelperClass.odooInvoice'
import CountryKey from '@salesforce/apex/stripeIntegrationHepler.CountryKey'
import updateLead from '@salesforce/apex/stripeIntegrationHepler.updateLead'
import createPayment from '@salesforce/apex/stripeIntegrationHepler.createPayment'
import addSubscriptionLineItems from '@salesforce/apex/stripeIntegrationHepler.addSubscriptionLineItems';
import getCouponCode from '@salesforce/apex/stripeIntegrationHepler.getCouponCode';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
import getCouponCodesForUI from '@salesforce/apex/stripeIntegrationHepler.getCouponCodesForUI';
import getRelatedAddons from '@salesforce/apex/stripeIntegrationHepler.getRelatedAddons';
import createCouponRelatedRecord from '@salesforce/apex/stripeIntegrationHepler.createCouponRelatedRecord';

export default class CardInput extends LightningElement {

  paymentError = false;
  @api methodToggle = 'standard flow';

  @track label = {
    CardNumber: "",
    FullName: "",
    Expiry: "",
    PayNow: ""
  };

  @api Qwantity = '1';
  @api textLanguage = 'English';

  numbersOfCars = '1';
  serviceSelected = 'FULL';
  @api woId;

  @api getB2BDetails(numbersOfCars, serviceSelected) {
    this.numbersOfCars = numbersOfCars;
    this.serviceSelected = serviceSelected;
    this.Qwantity = numbersOfCars;
  }

  listOfAddOns;
  @api getB2BDetailsForCustomize(listOfAddOns) {
    this.listOfAddOns = JSON.parse(listOfAddOns);
  }


  @api getSubscriptionMonths(subscriptionMonths) {
    this.subscriptionMonths = subscriptionMonths;
  }
  @api setPaymentPrice(paymentPrice, serviceSelected, woId) {
   
    this.paymentPrice = paymentPrice;
    if(/\./g.test(paymentPrice))
    {
    this.UIprice=paymentPrice;
    }else{
    this.UIprice=paymentPrice+".00";
    }
    this.serviceSelected = serviceSelected;
    this.woId = woId;
     this.calculateDiscountedPrice(this.paymentPrice);
  }

  @track couponsList;
  @api RelatedAddonsnames;

  @api setpaymentType(paymentType, subscriptionDate, currentCurrency, country, workOrderId, startTime, endTime, leadId, serviceSelected,paymentPrice) {
     this.paymentPrice = paymentPrice;
    if(/\./g.test(paymentPrice))
    {
    this.UIprice=paymentPrice;
    }else{
    this.UIprice=paymentPrice+".00";
    }
    this.serviceSelected = serviceSelected;
    // this.woId = workOrderId;
     this.calculateDiscountedPrice(this.paymentPrice);
    
    this.paymentType = paymentType;
    this.subscriptionDate = subscriptionDate;

    this.currency = currentCurrency;
    this.country = country;
    this.workOrderId = workOrderId;
    this.endTime = endTime;
    this.startTime = startTime;
    this.serviceSelected = serviceSelected;
    this.leadId = leadId;
   getRelatedAddons({workOrderId:this.workOrderId})
    .then(result=>{
      console.log('resultofaddons : ',result , this.serviceAppointmentId);
      var RelatedAddonsnames=result;

      RelatedAddonsnames.push(this.serviceSelected);
      this.RelatedAddonsnames=RelatedAddonsnames;
       getCouponCodesForUI({ servicenames: RelatedAddonsnames,country:this.country  }).then(result => {
      console.log('Got Result');
      console.log(result);
      this.couponsList = result;
    }).catch(error => {
      console.log(error);
    })

    })
    .catch(error=>{
        var RelatedAddonsnames;

      RelatedAddonsnames.push(this.serviceSelected);
      this.RelatedAddonsnames=RelatedAddonsnames;
       getCouponCodesForUI({ servicenames: [this.serviceSelected] ,country:this.country }).then(result => {
      console.log('Got Result');
      console.log(result);
      this.couponsList = result;
    }).catch(error => {
      console.log(error);
    })
    })

  }

  @api paymentPrice = '78';
  paymentType;
  subscriptionDate;
  subscriptionMonths;
  @api currency = 'chf';


  @api leadId = '0013M00001FoJVNQA3';

  @api workOrderId;
  startTime;
  endTime;


  cardImg = icons + '/ZawashIcons/cardPayment.jpg';

  @api paymentMethod = "Credit Card";
  @track paymentOptions = [
    { label: "Credit Card", value: "Credit Card", selected: true },
    { label: "Purchase Order", value: "Purchase Order" },
    { label: "Check", value: "Check" }
  ];

  @track card;

  @track valid = false;
  @track cardNumberValid = false;
  @track cardHolderNameValid = false;
  @track cardExpiryValid = false;
  @track cardCVCValid = false;

  @track cardNumberTouched = false;
  @track cardHolderNameTouched = false;
  @track cardExpiryTouched = false;
  @track cardCVCTouched = false;

  @track cardNumber = "";
  @track cardHolderName = "";
  @track cardExpiry = "";
  @track cardCVC = "";

  @api serviceResourceJSON = {};
  @api serviceAppointmentId;

  connectedCallback() {
    if(this.methodToggle=='link'){
      this.calculateDiscountedPrice(this.paymentPrice);
// this.paymentPrice = paymentPrice;
var checkPrice = this.paymentPrice;
if(/\./g.test(checkPrice))
{
    this.UIprice=this.paymentPrice;
}
else{
  this.UIprice=this.paymentPrice+".00";
}
this.workOrderId= this.woidid;
console.log('workOrderId', this.workOrderId);
getRelatedAddons({workOrderId:this.workOrderId})
    .then(result=>{
      console.log('resultofaddons : ',result , this.serviceAppointmentId);
      var RelatedAddonsnames=result;

      RelatedAddonsnames.push(this.serviceSelected);
      this.RelatedAddonsnames=RelatedAddonsnames;
       getCouponCodesForUI({ servicenames: RelatedAddonsnames,country:this.country  }).then(result => {
      console.log('Got Result');
      console.log(result);
      this.couponsList = result;
    }).catch(error => {
      console.log(error);
    })

    })
    .catch(error=>{
        var RelatedAddonsnames;

      RelatedAddonsnames.push(this.serviceSelected);
      this.RelatedAddonsnames=RelatedAddonsnames;
       getCouponCodesForUI({ servicenames: [this.serviceSelected],country:this.country  }).then(result => {
      console.log('Got Result');
      console.log(result);
      this.couponsList = result;
    }).catch(error => {
      console.log(error);
    })
    })
    }
    getLabels({ language: this.textLanguage }).then(result => {
      result.forEach(element => {
        this.label[element.Name] = element[this.textLanguage + '__c'];
        this.failPaymentError= this.label.failPaymentError;
      });
    }).catch(error => {
    })
    var self = this;
    //debugger;
    window.setTimeout(() => {
      self.card = new Card({
        context: self,
        form: self.template.querySelector(".cc-input"),
        container: ".cc-wrapper", // *required*

        width: 250, // optional — default 350px
        formatting: true, // optional - default true

        // Strings for translation - optional
        messages: {
          validDate: "valid\ndate", // optional - default 'valid\nthru'
          monthYear: "mm/yyyy" // optional - default 'month/year'
        },

        // Default placeholders for rendered fields - optional
        placeholders: {
          number: "•••• •••• •••• ••••",
          name: this.label.FullName,
          expiry: "••/••",
          cvc: "•••"
        },

        masks: {
          cardNumber: "•" // optional - mask card number
        },

        // if true, will log helpful messages for setting up Card
        debug: true // optional - default false
      });
    }, 50);
  }

  handleCCInput(event) {
    this.cardNumber = event.target.value;
    this.cardNumberValid = this.getIsValid(this.cardNumber, "cardNumber");
    this.cardNumberTouched = true;
    this.showFeedback();
    this.checkIfComplete();
  }

  handleNameInput(event) {
    this.cardHolderName = event.target.value;
    this.cardHolderNameValid = this.getIsValid(this.cardHolderName, "cardHolderName");
    this.cardHolderNameTouched = true;
    this.showFeedback();
    this.checkIfComplete();
  }
  handleExpiryInput(event) {
    this.cardExpiry = event.target.value;
    this.cardExpiryValid = this.getIsValid(this.cardExpiry, "cardExpiry");
    this.cardExpiryTouched = true;
    this.showFeedback();
    this.checkIfComplete();
  }
  handleCVVInput(event) {
    this.cardCVC = event.target.value;
    this.cardCVCValid = this.getIsValid(this.cardCVC, "cardCVC");
    this.cardCVCTouched = true;
    this.showFeedback();
    this.checkIfComplete();
  }

  showFeedback() {
    if (!this.cardNumberValid && this.cardNumberTouched) {
      //show error label
      this.template.querySelectorAll(".cardNumberError")[0].classList.remove("slds-hide");
      this.template.querySelectorAll(".cardNumberFormElement")[0].classList.add("slds-has-error");
    } else {
      this.template.querySelectorAll(".cardNumberError")[0].classList.add("slds-hide");
      this.template
        .querySelectorAll(".cardNumberFormElement")[0]
        .classList.remove("slds-has-error");
    }

    if (!this.cardHolderNameValid && this.cardHolderNameTouched) {
      //show error label
      this.template.querySelectorAll(".cardNameError")[0].classList.remove("slds-hide");
      this.template.querySelectorAll(".cardNameFormElement")[0].classList.add("slds-has-error");
    } else {
      this.template.querySelectorAll(".cardNameError")[0].classList.add("slds-hide");
      this.template.querySelectorAll(".cardNameFormElement")[0].classList.remove("slds-has-error");
    }

    if (!this.cardExpiryValid && this.cardExpiryTouched) {
      //show error label
      this.template.querySelectorAll(".cardExpiryError")[0].classList.remove("slds-hide");
      this.template.querySelectorAll(".cardExpiryFormElement")[0].classList.add("slds-has-error");
    } else {
      this.template.querySelectorAll(".cardExpiryError")[0].classList.add("slds-hide");
      this.template
        .querySelectorAll(".cardExpiryFormElement")[0]
        .classList.remove("slds-has-error");
    }

    if (!this.cardCVCValid && this.cardCVCTouched) {
      //show error label
      this.template.querySelectorAll(".cardCVVError")[0].classList.remove("slds-hide");
      this.template.querySelectorAll(".cardCVVFormElement")[0].classList.add("slds-has-error");
    } else {
      this.template.querySelectorAll(".cardCVVError")[0].classList.add("slds-hide");
      this.template.querySelectorAll(".cardCVVFormElement")[0].classList.remove("slds-has-error");
    }
  }

  //this syntax means we should be able to leave off 'this'
  checkIfComplete = () => {
    if (
      this.cardNumberValid &&
      this.cardHolderNameValid &&
      this.cardExpiryValid &&
      this.cardCVCValid
    ) {
      //send a message
      const detail = {
        type: "cardComplete",
        value: {
          cardNumber: this.cardNumber,
          cardHolderName: this.cardHolderName,
          cardCVV: this.cardCVC,
          cardExpiry: this.cardExpiry,
          cardType: this.card.cardType
        }
      };
      this.despatchCompleteEvent(detail);
    } else {
      // LCC.sendMessage({ type: 'cardIncomplete' });
      this.despatchIncompleteEvent();
    }
  };

  despatchCompleteEvent(cardData) {
    const changeEvent = new CustomEvent("cardComplete", { detail: cardData });
    this.dispatchEvent(changeEvent);
  }

  despatchIncompleteEvent() {
    const changeEvent = new CustomEvent("cardIncomplete", { detail: {} });
    this.dispatchEvent(changeEvent);
  }

  handlePaymentMethodChange(event) {
    const selectedMethod = event.detail.value;
    const changeEvent = new CustomEvent("paymentMethodChange", {
      detail: { paymentMethod: selectedMethod }
    });
    this.dispatchEvent(changeEvent);
  }

  //this syntax means we should be able to leave off 'this'
  getIsValid = (val, validatorName) => {
    var isValid, objVal;
    if (validatorName === "cardExpiry") {
      objVal = Payment.fns.cardExpiryVal(val);
      isValid = Payment.fns.validateCardExpiry(objVal.month, objVal.year);
    } else if (validatorName === "cardCVC") {
      isValid = Payment.fns.validateCardCVC(val, this.card.cardType);
    } else if (validatorName === "cardNumber") {
      isValid = Payment.fns.validateCardNumber(val);
    } else if (validatorName === "cardHolderName") {
      isValid = val !== "";
    }
    return isValid;
  };

  hideCardPayment() {
    console.log('OUTPUT : occurs',);
    if (this.methodToggle == 'link') {
      const customEventVar = new CustomEvent('goback', { detail: false, bubbles: true });
      this.dispatchEvent(customEventVar);
    }
    else {

      const customEventVar = new CustomEvent('hidecardpayment', { detail: false, bubbles: true });
      this.dispatchEvent(customEventVar);
    }
  }

  paymentCurrency = 'eur';


  paymentdone() {

    // var paymentValue=this.paymentPrice;
    // if(!this.paymentPrice.includes('.')){
    //      paymentValue= parseFloat(this.paymentPrice) * 100
    // }

    var customerName;
    var customerEmail;

    var odooCustomeId;
    var customerID;
    customer({ i: this.leadId })
      .then(response => {
        customerName = response.Name;
        if (response.hasOwnProperty('Email')) {
          customerEmail = response.Email;
        }
        else {
          customerEmail = response.Email__c;
        }

        odooCustomer({ lId: this.leadId })
          .then(response => {
            odooCustomeId = response;
          }).catch(error => {
          })


        var requestOptions = {
          method: 'POST',
          headers: {
            "Authorization": "Bearer " + this.SkApiKey,
          },
          redirect: 'follow'
        };

        fetch(`https://api.stripe.com/v1/customers?name=${customerName}&email=${customerEmail}`, requestOptions)
          .then(response => response.text())
          .then(result => {
            var self = this;
            var d = JSON.parse(result);
            customerID = d.id;

            updateLead({ i: this.leadId, io: d.id })
              .then(response => {
              })
               var cnumber='4242424242424242';
    var dat=[" 09 "," 2028 "];
    console.log('dat : ',dat);
    console.log('0 : ',dat[0]);
    console.log('1 : ',dat[1]);
    var cv='123';
    var c;

   if(parseFloat( this.paymentPrice)>0){
  
  
      cnumber = this.template.querySelector('[data-id="card-number"]').value.split(" ").join("");
    var wholedate = this.template.querySelector('[data-id="exp-date"]').value;
      dat = wholedate.split('/');
    
      cv = this.template.querySelector('[data-id="cvv"]').value;
   }
          

            var requestOptions = {
              method: 'POST',
              headers: {
                "Authorization": "Bearer " + this.SkApiKey,
              },
              redirect: 'follow'
            };

            fetch(`https://api.stripe.com/v1/payment_methods?type=card&card[exp_month]=${dat[0].trim()}&card[exp_year]=${dat[1].trim()}&card[number]=${cnumber}&card[cvc]=${cv}`, requestOptions)
              .then(response => response.text())
              .then(result => {

                var c = JSON.parse(result);
                if (c.id != null) {

                  var requestOptions = {
                    method: 'POST',
                    headers: {
                      "Authorization": "Bearer " + this.SkApiKey,
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    redirect: 'follow'
                  };

                  fetch(`https://api.stripe.com/v1/payment_methods/${c.id}/attach?customer=${customerID}`, requestOptions)
                    .then(response => response.text())
                    .then(async result => {

                      var c = JSON.parse(result);
                      if (c.id != null) {

                        var requestOptions = {
                          method: 'POST',
                          headers: {
                            "Authorization": "Bearer " + this.SkApiKey,
                            "Content-Type": "application/x-www-form-urlencoded"
                          },
                          redirect: 'follow'
                        };


                     if(this.paymentPrice>0){
                        fetch(`https://api.stripe.com/v1/payment_intents?amount=${((this.paymentPrice) * 100).toFixed(2).slice(0, -3)}&currency=${this.currency}&customer=${customerID}&payment_method=${c.id}&confirm=true&error_on_requires_action=true&return_url=https://google.com&off_session=true`, requestOptions)
                          .then(response => response.text())
                          .then(async result => {
                            var paymentInfo = JSON.parse(result);

                            if (paymentInfo.status == 'succeeded') {
                               let created = new Promise((resolve,reject) => {
                              // do some async task
                                  
                              
                              createPayment({ paymentId: paymentInfo.id, customerID: paymentInfo.customer, status: paymentInfo.status, amount: paymentInfo.amount, odooCustomerId: odooCustomeId, workorderId: this.woId, methodToggle: this.methodToggle, serviceAppointmentId: this.serviceAppointmentId, Qwantity: '1',currentCurrency:this.currency })
                                .then(result => {
                                  odooInvoice({ TId: result })
                                    .then(response => {
                                      var lis = [];
                                      lis.push(this.serviceAppointmentId);
                                      createCouponRelatedRecord({serviceAppointmentId:this.serviceAppointmentId,accountId:this.leadId.trim(),coupon:this.couponToApply,discountAmount:this.senddiscountamount,couponAppliedtrue:this.couponAppliedtrue})
                                          .then(result=>{console.log(result)
                                            invoicePdfmethod({ recordIds: lis })
                                        .then(result => {
                                           
                                          resolve();
                                        }).catch(error => {
                                          reject()
                                        })
                                          })
                              if (this.methodToggle == 'link') {        
                                   this.hideCardPayment();
                              }
                                     
                                    })
                                })
                                .catch(error => {
                                  // console.log(error);
                                  reject();
                                })
                                });

                              if (this.methodToggle != 'link') {
                                await created;
                                console.log('OUTPUT before sendTime : ',this.startTime, this.endTime);
                                sendTime({ worderId: this.workOrderId, startT: this.startTime, endT: this.endTime, Currencystr: this.currency })
                                  .then(result => {
                                    try {
                                      this.serviceResourceJSON = result;
                                      this.template.querySelector('.loader').style.display = 'none';
                                      const customEventVar = new CustomEvent('paymentsuccessfull', { detail: [this.serviceAppointmentId, this.serviceResourceJSON], bubbles: true });
                                      this.dispatchEvent(customEventVar);
                                    }
                                    catch (err) {
                                    }
                                  }).catch(error => {
                                  })
                              } else {
                                this.template.querySelector('.loader').style.display = 'none';
                                this.hideCardPayment();
                                // this.hideCardPay();
                              }

                            } else if (paymentInfo.status == 'failed') {
                              createPayment({ paymentId: paymentInfo.id, customerID: paymentInfo.customer, status: paymentInfo.status, amount: paymentInfo.amount, odooCustomerId: odooCustomeId, workorderId: this.woId, methodToggle: this.methodToggle, serviceAppointmentId: this.serviceAppointmentId, Qwantity: '1',currentCurrency:this.currency })
                                .then(result => {
                                  var lis = [];
                                  lis.push(this.serviceAppointmentId);
                                  invoicePdfmethod({ recordIds: lis })
                                    .then(result => { })
                                })
                                .catch(error => { })
                                 this.failPaymentError= this.label.failPaymentError;
                              this.paymentError = true;
                              this.template.querySelector('button').disabled = false;

                            } else if (paymentInfo.error != null) {
                               this.failPaymentError= this.label.failPaymentError;
                              this.paymentError = true;
                              this.template.querySelector('button').disabled = false;

                            }
                          }
                          ).catch(error => { });
                     }
                     else if(parseFloat( this.paymentPrice)==0){
                       let newpromise=new Promise((resolve,reject)=>{

                     
                                  createPayment({ paymentId: 'Success', customerID: customerID, status: 'Success', amount: '0', odooCustomerId: odooCustomeId, workorderId: this.woId, methodToggle: this.methodToggle, serviceAppointmentId: this.serviceAppointmentId, Qwantity: '1',currentCurrency:this.currency })
                                .then(result => {
                                  odooInvoice({ TId: result })
                                    .then(response => {
                                      var lis = [];
                                      lis.push(this.serviceAppointmentId);
                                      createCouponRelatedRecord({serviceAppointmentId:this.serviceAppointmentId,accountId:this.leadId.trim(),coupon:this.couponToApply,discountAmount:this.senddiscountamount,couponAppliedtrue:this.couponAppliedtrue})
                                          .then(result=>{console.log(result)
                                            invoicePdfmethod({ recordIds: lis })
                                        .then(result => {
                                          resolve()
                                         
                                        }).catch(error => {
                                        })
                                          })
                                    
  if (this.methodToggle == 'link') {
     this.hideCardPayment();
  }

                                      
                                    })
                                })
                                .catch(error => {
                                  // console.log(error);
                                })
                                  })

                                
                              if (this.methodToggle != 'link') {
                                await newpromise;
                                console.log('OUTPUT before sendTime : ',this.startTime, this.endTime);
                                sendTime({ worderId: this.workOrderId, startT: this.startTime, endT: this.endTime, Currencystr: this.currency })
                                  .then(result => {
                                    try {
                                      this.serviceResourceJSON = result;
                                      this.template.querySelector('.loader').style.display = 'none';
                                      const customEventVar = new CustomEvent('paymentsuccessfull', { detail: [this.serviceAppointmentId, this.serviceResourceJSON], bubbles: true });
                                      this.dispatchEvent(customEventVar);
                                    }
                                    catch (err) {
                                    }
                                  }).catch(error => {
                                  })
                              } else {
                                this.template.querySelector('.loader').style.display = 'none';
                                this.hideCardPayment();
                                // this.hideCardPay();
                              }
                     }

                      } else if (c.error != null) {
                         this.failPaymentError= this.label.failPaymentError;
                        this.paymentError = true;
                        this.template.querySelector('button').disabled = false;

                      }
                    }).catch(error => { });

                }
                else if (c.error != null) {
                   this.failPaymentError= this.label.failPaymentError;
                  this.paymentError = true;
                  this.template.querySelector('button').disabled = false;
                }
              })
          })
      })
  }

  subscriptionendDate;
  UIprice;
  couponcodeValue;

  dateWithMonthsDelay(months) {
    const date = new Date(this.subscriptionDate)
    date.setMonth(date.getMonth() + months)
    let currDate = date.toJSON().slice(0, 10);
    this.subscriptionendDate = Math.floor(new Date(currDate).getTime() / 1000)
  }
  subscriptionDate = '2022-09-11';
  invoicedate = '2022-09-11';
  months;

  subscriptionPayment() {
    var customerName;
    var customerEmail;
    var customerID;

    customer({ i: this.leadId })
      .then(response => {
        customerName = response.Name;
        customerEmail = response.Email__c;

        var requestOptions = {
          method: 'POST',
          headers: {
            "Authorization": "Bearer " + this.SkApiKey,
          },
          redirect: 'follow'
        };

        fetch(`https://api.stripe.com/v1/customers?name=${customerName}&email=${customerEmail}`, requestOptions)
          .then(response => response.text())
          .then(result => {
            var d = JSON.parse(result);
            customerID = d.id;

            updateLead({ i: this.leadId, io: d.id })
              .then(response => {
              })

            if (this.subscriptionMonths == '6') {
              this.months = '6';
              this.dateWithMonthsDelay(6);
            }
            else {
              this.months = '12';
              this.dateWithMonthsDelay(12);
            }
            var subscriptionstartdate = Math.floor(new Date(this.subscriptionDate).getTime() / 1000);
            let currentDate = new Date().toJSON().slice(0, 10);
           var cnumber='4242424242424242';
    var dat=[" 09 "," 2028 "];
    console.log('dat : ',dat);
    console.log('0 : ',dat[0]);
    console.log('1 : ',dat[1]);
    var cv='123';
    var c;

   if(parseFloat( this.paymentPrice)>0){
  
  
      cnumber = this.template.querySelector('[data-id="card-number"]').value.split(" ").join("");
    var wholedate = this.template.querySelector('[data-id="exp-date"]').value;
      dat = wholedate.split('/');
    
      cv = this.template.querySelector('[data-id="cvv"]').value;
   }
            var requestOptions = {
              method: 'POST',
              headers: {
                "Authorization": "Bearer " + this.SkApiKey,
              },
              redirect: 'follow'
            };

            fetch(`https://api.stripe.com/v1/payment_methods?type=card&card[exp_month]=${dat[0].trim()}&card[exp_year]=${dat[1].trim()}&card[number]=${cnumber}&card[cvc]=${cv}`, requestOptions)
              .then(response => response.text())
              .then(result => {
                c = JSON.parse(result);
                if (c.id != null) {

                  var requestOptions = {
                    method: 'POST',
                    headers: {
                      "Authorization": "Bearer " + this.SkApiKey,
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    redirect: 'follow'
                  };

                  fetch(`https://api.stripe.com/v1/payment_methods/${c.id}/attach?customer=${customerID}`, requestOptions)
                    .then(response => response.text())
                    .then(result => {
                      if (c.id != null) {

                        var requestOptions = {
                          method: 'POST',
                          headers: {
                            "Authorization": "Bearer " + this.SkApiKey,

                            "Content-Type": "application/x-www-form-urlencoded",

                          },
                          redirect: 'follow'
                        };

                        fetch(`https://api.stripe.com//v1/customers/${customerID}?invoice_settings[default_payment_method]=${c.id}`, requestOptions)
                          .then(response => response.text())
                          .then(result => {
                            c = JSON.parse(result);
                            if (c.id != null) {
                              var requestOptions = {
                                method: 'POST',
                                headers: {
                                  "Authorization": "Bearer " + this.SkApiKey,
                                  "Content-Type": "application/x-www-form-urlencoded"
                                },
                                redirect: 'follow'
                              };

                              if (this.serviceSelected != 'Customize') {

                                if (this.subscriptionDate == currentDate) {
                                  let valcode='';
                                  if(this.couponcodeValue!=null){
                                   valcode= `&coupon=${this.couponcodeValue}`;
                                  }
                                  fetch(`https://api.stripe.com//v1/subscriptions?items[0][price]=${this.subsCriptionPrice}&items[0][quantity]=${parseInt(this.numbersOfCars)}&customer=${customerID}&cancel_at=${this.subscriptionendDate}&off_session=true${valcode}`, requestOptions)
                                    .then(response => response.text())
                                    .then(result => {
                                      var paymentInfo = JSON.parse(result);
                                      if (paymentInfo.id != null) {
                                        createSubscription({
                                          subId: paymentInfo.id, accId: this.leadId, workorderId: this.workOrderId, amount: this.paymentPrice, months: this.months, invoicedate: this.invoicedate
                                        })
                                          .then(result => {
                                           
                                          createCouponRelatedRecord({serviceAppointmentId:this.serviceAppointmentId,accountId:this.leadId.trim(),coupon:this.couponToApply,discountAmount:this.senddiscountamount,couponAppliedtrue:this.couponAppliedtrue})
                                                                                      .then(result=>{console.log(result)
                                                                                       var lis = [];
                                      lis.push(this.serviceAppointmentId);
                                      invoicePdfmethod({ recordIds: lis })
                                                    .then(result=>{})
                                                                                      })

                                          })
                                      } else {
                                         this.failPaymentError= this.label.failPaymentError;
                                        this.paymentError = true;

                                        // alert('Subscription Failed');
                                        this.template.querySelector('button').disabled = false;

                                      }
                                    }).catch(error => { });
                                } else {
                                  let valcode='';
                                  if(this.couponcodeValue!=null){
                                   valcode= `&phases[0][coupon]=${this.couponcodeValue}`;
                                  }
                                  fetch(`https://api.stripe.com/v1/subscription_schedules?phases[0][items][0][price]=${this.subsCriptionPrice}&phases[0][items][0][quantity]=${parseInt(this.numbersOfCars)}&customer=${customerID}&phases[0][end_date]=${this.subscriptionendDate}&start_date=${subscriptionstartdate}${valcode}`, requestOptions)
                                    .then(response => response.text())
                                    .then(result => {
                                      var paymentInfo = JSON.parse(result);
                                      if (paymentInfo.id != null) {
                                        createSubscription({
                                          subId: paymentInfo.id, accId: this.leadId, workorderId: this.workOrderId, amount: this.paymentPrice, months: this.months, invoicedate: this.invoicedate
                                        }).then(result => {
                                          
                                         })
                                         console.log('OUTPUT before sendTime : ',this.startTime, this.endTime);
                                        sendTime({ worderId: this.workOrderId, startT: this.startTime, endT: this.endTime, Currencystr: this.currency })
                                          .then(result => {
                                            try {
                                          createCouponRelatedRecord({serviceAppointmentId:this.serviceAppointmentId,accountId:this.leadId.trim(),coupon:this.couponToApply,discountAmount:this.senddiscountamount,couponAppliedtrue:this.couponAppliedtrue})
                                       .then(result=>{console.log(result)})
                                                    var lis = [];
                                      lis.push(this.serviceAppointmentId);
                                      invoicePdfmethod({ recordIds: lis })
                                                    .then(result=>{})
                                              this.serviceResourceJSON = result;
                                              const customEventVar = new CustomEvent('paymentsuccessfull', { detail: [this.serviceAppointmentId, this.serviceResourceJSON], bubbles: true });
                                              this.dispatchEvent(customEventVar);

                                            }
                                            catch (err) { }
                                          }).catch(error => { })
                                      }

                                      else {
                                         this.failPaymentError= this.label.failPaymentError;
                                        this.paymentError = true;
                                        this.template.querySelector('button').disabled = false;

                                      }
                                    }).catch(error => { });
                                }
                              }

                              else {
                                if (this.subscriptionDate == currentDate) {
                                  let valcode='';
                                  if(this.couponcodeValue!=null){
                                   valcode= `&coupon=${this.couponcodeValue}`;
                                  }
                                  fetch(`https://api.stripe.com//v1/subscriptions?${this.wholeAddons}customer=${customerID}&cancel_at=${this.subscriptionendDate}&off_session=true${valcode}`, requestOptions)
                                    .then(response => response.text())
                                    .then(result => {
                                      var paymentInfo = JSON.parse(result);
                                      if (paymentInfo.id != null) {
                                        createSubscription({
                                          subId: paymentInfo.id, accId: this.leadId, workorderId: this.workOrderId, amount: this.paymentPrice, months: this.months, invoicedate: this.invoicedate
                                        }).then(result => {
                                          createCouponRelatedRecord({serviceAppointmentId:this.serviceAppointmentId,accountId:this.leadId.trim(),coupon:this.couponToApply,discountAmount:this.senddiscountamount,couponAppliedtrue:this.couponAppliedtrue})
                                     .then(result=>{console.log(result)
                                          var lis = [];
                                      lis.push(this.serviceAppointmentId);
                                      invoicePdfmethod({ recordIds: lis })
                                                    .then(result=>{})
                                     })

                                         })
                                      } else {
                                         this.failPaymentError= this.label.failPaymentError;
                                        this.paymentError = true;
                                        this.template.querySelector('button').disabled = false;
                                      }
                                    })
                                } else {
                                  let valcode='';
                                  if(this.couponcodeValue!=null){
                                   valcode= `&phases[0][coupon]=${this.couponcodeValue}`;
                                  }
                                  fetch(`https://api.stripe.com/v1/subscription_schedules?${this.wholeAddons}customer=${customerID}&phases[0][end_date]=${this.subscriptionendDate}&start_date=${subscriptionstartdate}${valcode}`, requestOptions)
                                    .then(response => response.text())
                                    .then(result => {
                                      var paymentInfo = JSON.parse(result);
                                      if (paymentInfo.id != null) {
                                        createSubscription({
                                          subId: paymentInfo.id, accId: this.leadId, workorderId: this.workOrderId, amount: this.paymentPrice, months: this.months, invoicedate: this.invoicedate
                                        })
                                          .then(result => { })
                                          console.log('OUTPUT before sendTime : ',this.startTime, this.endTime);
                                        sendTime({ worderId: this.workOrderId, startT: this.startTime, endT: this.endTime, Currencystr: this.currency })
                                          .then(result => {
                                            try {
                                          createCouponRelatedRecord({serviceAppointmentId:this.serviceAppointmentId,accountId:this.leadId.trim(),coupon:this.couponToApply,discountAmount:this.senddiscountamount,couponAppliedtrue:this.couponAppliedtrue})
                                         .then(result=>{console.log(result)})
                                           var lis = [];
                                      lis.push(this.serviceAppointmentId);
                                      invoicePdfmethod({ recordIds: lis })
                                                    .then(result=>{})
                                              this.serviceResourceJSON = result;
                                              const customEventVar = new CustomEvent('paymentsuccessfull', { detail: [this.serviceAppointmentId, this.serviceResourceJSON], bubbles: true });
                                              this.dispatchEvent(customEventVar);
                                            }
                                            catch (err) { }
                                          }).catch(error => { })
                                      }

                                      else {
                                         this.failPaymentError= this.label.failPaymentError;
                                        this.paymentError = true;

                                        // alert('Subscription Failed');
                                        this.template.querySelector('button').disabled = false;

                                      }
                                    }).catch(error => { });
                                }
                              }

                            }
                            else if (c.error != null) {
                               this.failPaymentError= this.label.failPaymentError;
                              this.paymentError = true;
                              this.template.querySelector('button').disabled = false;
                            }
                          }).catch(error => { });
                      }
                      else if (c.error != null) {
                         this.failPaymentError= this.label.failPaymentError;
                        this.paymentError = true;

                        this.template.querySelector('button').disabled = false;

                      }
                    }).catch(error => { });;

                }
                else if (c.error != null) {
                   this.failPaymentError= this.label.failPaymentError;
                  this.paymentError = true;
                  this.template.querySelector('button').disabled = false;
                }
              }).catch(error => { });
          })
      })
  }

  adddonswithprices = [];
  wholeAddons;

  paymentType = 'One Time';
  SkApiKey;
  @api country = 'Switzerland';
  subsCriptionPrice;
  @api woidid;

taxAmount;
  calculateDiscountedPrice(originalPrice) {
    // if (discountPercent < 0 || discountPercent > 100) {
    //   throw new Error("Discount percentage must be between 0 and 100");
    // }
    var discountAmount;
    if(this.currency=='CHF'){
      var disamount=parseFloat(originalPrice) * (parseFloat('7.7') / 100);
 discountAmount= disamount.toFixed(2);
    }else{
        var disamount=parseFloat(originalPrice) * (parseFloat('20') / 100);
 discountAmount= disamount.toFixed(2);

    }
    
    // const discountedPrice = parseFloat(originalPrice - discountAmount);
    // this.paymentPrice = String(discountedPrice);
    this.taxAmount=discountAmount;

    // return discountedPrice;
  }


	failPaymentError;
  senddiscountamount;


  couponcode;
  @track couponError;
  couponAppliedtrue=false;

  dothePayment() {

    if (this.couponToApply != '' && this.couponToApply != null && this.couponToApply != undefined) {
      
      this.couponcode = this.couponToApply;  
      this.couponAppliedtrue=true; 
      console.log('this.couponcod : ',this.couponcode, 'servicename:', this.serviceSelected, 'accountId:', this.leadId, 'currenc:', this.currency, 'amount:', this.paymentPrice);
      getCouponCode({ coupon: this.couponToApply.trim(), servicename: this.RelatedAddonsnames, accountId: this.leadId.trim(), currenc: this.currency, amount: this.paymentPrice ,updating:'updating',serviceAppointmentId:this.serviceAppointmentId,country:this.country})
        .then(result => {
          console.log('result : ', result);
          if (result && result.length > 1) {
                  this.template.querySelector('.loader').style.display = 'block';

            this.paymentPrice = result[1];
            this.senddiscountamount=result[2];
            this.couponcodeValue=result[3];
            // this.calculateDiscountedPrice(this.paymentPrice, result[1]);
            this.checkingCouponornot();

          }else{
            this.failPaymentError=this.label.Coupon_code_is_not_applicable;
            this.couponError = true;
          }
        }).catch(error => {
          this.failPaymentError=this.label.Coupon_code_is_not_applicable;
          this.couponError = true;
          console.log('errorcode  : ', error);

        })
    } else {
            this.template.querySelector('.loader').style.display = 'block';

      this.checkingCouponornot();
    }
  }

  checkingCouponornot() {

      var cnumber='4242424242424242';
    var dat=[" 09 "," 2028 "];
    console.log('dat : ',dat);
    
    var cv='123';
    var c;

   if(parseFloat( this.paymentPrice)>0){
  
  
      cnumber = this.template.querySelector('[data-id="card-number"]').value.split(" ").join("");
    var wholedate = this.template.querySelector('[data-id="exp-date"]').value;
      dat = wholedate.split('/');
    
      cv = this.template.querySelector('[data-id="cvv"]').value;
   }
    if (cnumber == '' || wholedate == '' || cv == '') {
      console.log('somthing is null');
        this.failPaymentError= this.label.failPaymentError;
      this.paymentError = true;

    }
    else {

      // this.template.querySelector('.loader').style.display = 'block';



      if (this.serviceSelected != 'Customize') {
        ApiKey({ country: this.country.trim(), servicename: this.serviceSelected.trim(), curren: this.currency.trim() })
          .then(result => {
            this.SkApiKey = result.Value__c;
            this.subsCriptionPrice = result.Price_Key__c;
            if (this.paymentType === 'Subscription') {
              this.subscriptionPayment();
            }
            else if (this.paymentType === 'One Time') {
              this.paymentdone();
            }
          })
          .catch(error => {
            this.error = error;
            this.template.querySelector('.loader').style.display = 'none';
             this.failPaymentError= this.label.failPaymentError;
            this.paymentError = true;

          });
      }
      else {
        CountryKey({ country: this.country })
          .then(response => {
            this.SkApiKey = response.Value__c;
            addSubscriptionLineItems({ country: this.country, listOfAddOns: this.listOfAddOns, curren: this.currency })
              .then(result => {
                this.adddonswithprices = result;
                var wholeAddons = "";
                let currentDate = new Date().toJSON().slice(0, 10);

                if (this.subscriptionDate != currentDate) {

                  for (let i = 0; i < this.adddonswithprices.length; i++) {
                    wholeAddons += `phases[0][items][${i}][price]=` + this.adddonswithprices[i].price + "&";
                    wholeAddons += `phases[0][items][${i}][quantity]=` + this.adddonswithprices[i].quantity + "&";
                  }
                }
                else {
                  for (let i = 0; i < this.adddonswithprices.length; i++) {
                    wholeAddons += `items[${i}][price]=` + this.adddonswithprices[i].price + "&";
                    wholeAddons += `items[${i}][quantity]=` + this.adddonswithprices[i].quantity + "&";
                  }
                }
                this.wholeAddons = wholeAddons;
                this.subscriptionPayment();

              })
          })
      }
    }
  }
  removeModal() {
    this.template.querySelector('.loader').style.display = 'none';
    this.paymentError = false;
  }



  @track couponApplied = false;

  @track couponsToggleStatus = 'View more coupons 🠋';
  showMoreCoupons() {
    this.template.querySelector('.availableCouponsList').classList.toggle('availableCouponsListHidden');
    if (this.couponsToggleStatus == 'View more coupons 🠋') {
      this.couponsToggleStatus = 'Hide coupons 🠉';
    }
    else {
      this.couponsToggleStatus = 'View more coupons 🠋';
    }
  }


  couponToApply;
  discountedAmount;
  discountePrice;
  couponSelected(event) {
    this.couponToApply = event.currentTarget.dataset.coupon;
    this.showMoreCoupons();
    this.applyCoupon();
    console.log('couponsel', this.couponToApply, 'servicename',this.RelatedAddonsnames, 'accId',this.leadId, 'currency',this.currency,  'amount',this.paymentPrice);
     getCouponCode({ coupon: this.couponToApply, servicename: this.RelatedAddonsnames, accountId: this.leadId, currenc: this.currency, amount: this.paymentPrice,updating:'notupdating',serviceAppointmentId:this.serviceAppointmentId,country:this.country })
        .then(result => {
          console.log('result : ', result);
          
          if(result && result.length>1){
          this.discountedAmount=result[1];
          if(/\./g.test(result[2]))
          {
          this.discountePrice=result[2];
          }else{
          this.discountePrice=result[2]+".00";
          }
           this.couponApplied = true;
          }
          else{
            this.failPaymentError=this.label.Coupon_code_is_not_applicable;
            this.couponError = true;
          }
        })

   
   
  }

  applingCoupon() {
    this.couponToApply = this.template.querySelector('.couponInputArea input').value;
    this.couponsToggleStatus = 'Hide coupons 🠉';
    // this.showMoreCoupons();
    this.applyCoupon();
    getCouponCode({ coupon: this.couponToApply, servicename: this.RelatedAddonsnames, accountId: this.leadId, currenc: this.currency, amount: this.paymentPrice,updating:'notupdating',serviceAppointmentId:this.serviceAppointmentId,country:this.country })
        .then(result => {
          console.log('result : ', result);
          
          if(result && result.length>1){
          this.discountedAmount=result[1];
          if(/\./g.test(result[2]))
          {
          this.discountePrice=result[2];
          }else{
          this.discountePrice=result[2]+".00";
          }
           this.couponApplied = true;
          }
          else{
            this.couponToApply='';
            this.failPaymentError=this.label.Coupon_code_is_not_applicable;
            this.couponError = true;
          }
        })
    // this.couponApplied = true;
  }

  applyCoupon() {
    console.log('Coupon Applied');
    console.log(this.couponToApply);
  }
  couponRemoved() {
    this.couponApplied = false;
    this.couponToApply = undefined;
  }
}