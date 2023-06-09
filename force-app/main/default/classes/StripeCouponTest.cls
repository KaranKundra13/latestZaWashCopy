@isTest
public class StripeCouponTest {

    @isTest
    static void testCreateCoupon() {

        Integer amountOff = null;
        String currency1 = 'USD';

        // Set up a mock response for the API call

       
        test.startTest();
        Test.setMock(HttpCalloutMock.class, new mockCallout(200,'{"id":"test_coupon","object":"coupon","amount_off":null,"created":1502877638,"currency":"USD","duration":"repeating","duration_in_months":3,"livemode":false,"max_redemptions":null,"metadata":{},"name":"Test Coupon","percent_off":10,"redeem_by":null,"times_redeemed":0,"valid":true}'));	
       
       
        // Call the createCoupon method
        StripeCoupon.createCoupon(amountOff, currency1 , '234567ytgfghj');

        Test.stopTest();
    }
}