public class StripeCoupon {
 
    @AuraEnabled
    public static String createCoupon(Integer amountOff, String currency1 , string apiKey) {
        try {
            Http h = new Http();
            HttpRequest req = new HttpRequest();
            req.setMethod('POST');
            req.setEndpoint('https://api.stripe.com/v1/coupons');
            req.setHeader('Authorization', 'Bearer '+apiKey);
            req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            String body = 'duration=once&currency='+currency1+'&amount_off='+amountOff+'&max_redemptions=1';
            req.setBody(body);
            HttpResponse res = h.send(req);
            System.debug(res.getBody());
            return JSON.serialize(res.getBody());
        } catch (System.CalloutException e) {
            System.debug(e.getMessage());
            return JSON.serialize(e.getMessage());
        }
    }
}