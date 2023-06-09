import { LightningElement, api } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';

export default class CardPayment extends LightningElement {

  label = {
    PayNow: "",
    AccountHolderName: "",
    AccountNumber: "",
    AccountType: "",
    RoutingNumber: "",
    FullName: ""
  }


  bankImg = icons + '/ZawashIcons/bankPayment.jpg';

  @api textLanguage;

  connectedCallback() {
    getLabels({ language: this.textLanguage }).then(result => {
      result.forEach(element => {
        this.label[element.Name] = element[this.textLanguage + '__c'];
      });
    }).catch(error => {
    })
  }


  onlynumbers(event) {

    let targetId = event.currentTarget.dataset.id;


    var lengt = this.template.querySelector(`[data-id="${targetId}"]`).value.length;
    if (!(/[0-9]/g.test(this.template.querySelector(`[data-id="${targetId}"]`).value.charAt(lengt - 1)))) {

      var char = this.split(this.template.querySelector(`[data-id="${targetId}"]`).value, lengt - 1);
      this.template.querySelector(`[data-id="${targetId}"]`).value = char[0] + '';
      return;
    }

  }

  split(str, index) {
    const result = [str.slice(0, index), str.slice(index)];

    return result;
  }

  space(event) {
    const key = event.key; // const {key} = event; ES6+




    if (this.template.querySelector('[data-id="account-number"]').value.length == 4 && key !== 'Backspace' || this.template.querySelector('[data-id="account-number"]').value.length == 9 && key !== 'Backspace' || this.template.querySelector('[data-id="account-number"]').value.length == 14 && key !== 'Backspace') {
      this.template.querySelector('[data-id="account-number"]').value += ' ';


    }

  }

  slash(event) {
    const key = event.key; // const {key} = event; ES6+
    if (this.template.querySelector('[data-id="exp-date"]').value.length == 2 && key !== 'Backspace') {
      this.template.querySelector('[data-id="exp-date"]').value += '/';
    }
  }


  value = 'individual';

  get options() {
    return [
      { label: this.label.Individual, value: 'individual' },
      { label: this.label.Company, value: 'company' }

    ];
  }

  handleChange(event) {
    this.value = event.detail.value;
  }

  hideBankPayment() {
    const customEventVar = new CustomEvent('hidebankpayment', { detail: false, bubbles: true });
    this.dispatchEvent(customEventVar);
  }


  subscriptionDate = '2022-09-08';
  subscriptionMonths = 'six';
  dateWithMonthsDelay(months) {
    const date = new Date(this.subscriptionDate)
    date.setMonth(date.getMonth() + months)
    let currDate = date.toJSON().slice(0, 10);
    this.subscriptionendDate = Math.floor(new Date(currDate).getTime() / 1000)
  }

  doPayment() {

    if (this.subscriptionMonths === 'six') {
      this.dateWithMonthsDelay(6);

    }
    else {
      this.dateWithMonthsDelay(12);
    }




    var subscriptionstartdate = Math.floor(new Date(this.subscriptionDate).getTime() / 1000);


    var accountHoldername = this.template.querySelector('[data-id="accountholder-name"]').value;



    var accountNumber = this.template.querySelector('[data-id="account-number"]').value.split(" ").join("");


    var accountType = this.template.querySelector('[data-id="account-type"]').value;


    var routingNumber = this.template.querySelector('[data-id="routing-number"]').value
    var c;
    var requestOptions = {
      method: 'POST',
      headers: {
        "Authorization": "Bearer sk_test_FaMZfep2Ay2Tiy5l5v8hI0hO00CcVk6OwP"
      },
      redirect: 'follow'
    };

    fetch(`https://api.stripe.com/v1/tokens?bank_account[country]=CH&bank_account[currency]=CHF&bank_account[account_holder_name]=${accountHoldername}&bank_account[account_holder_type]=${accountType}&bank_account[routing_number]=${routingNumber}&bank_account[account_number]=${accountNumber}`, requestOptions)
      .then(response => response.text())
      .then(result => {

        var c = JSON.parse(result);
        var requestOptions = {
          method: 'POST',
          headers: {
            "Authorization": "Bearer sk_test_FaMZfep2Ay2Tiy5l5v8hI0hO00CcVk6OwP",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          redirect: 'follow'
        };

        fetch(`https://api.stripe.com/v1/payment_methods/${c.id}/attach?customer=cus_MO56hMgXPZVwXe`, requestOptions)
          .then(response => response.text())
          .then(result => {
            var requestOptions = {
              method: 'POST',
              headers: {
                "Authorization": "Bearer sk_test_FaMZfep2Ay2Tiy5l5v8hI0hO00CcVk6OwP",
                "Content-Type": "application/x-www-form-urlencoded",
              },
              redirect: 'follow'
            };

            fetch(`https://api.stripe.com//v1/customers/cus_MO56hMgXPZVwXe?invoice_settings[default_payment_method]=${c.id}`, requestOptions)
              .then(response => response.text())
              .then(result => {

                var requestOptions = {
                  method: 'POST',
                  headers: {
                    "Authorization": "Bearer sk_test_FaMZfep2Ay2Tiy5l5v8hI0hO00CcVk6OwP",
                    "Content-Type": "application/x-www-form-urlencoded"
                  },
                  redirect: 'follow'
                };

                fetch(`https://api.stripe.com//v1/subscriptions?items[0][price]=price_1LfJ5eEcuSui0LDPSfN9IUpW&customer=cus_MO56hMgXPZVwXe&cancel_at=${this.subscriptionendDate}&off_session=true&billing_cycle_anchor=${subscriptionstartdate}`, requestOptions)
                  .then(response => response.text())
                  .then(result => {
                    var paymentInfo = JSON.parse(result);
                    createSubscription({ subId: paymentInfo.id })
                      .then(result => {
                      })
                  })
                  .catch(error => {
                  });
              })
              .catch(error => {
              });
          })
          .catch(error => {
          });
      })
      .catch(error => {
      });
  }
}