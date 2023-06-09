global class stripeMockCallout implements HttpCalloutMock {
    global HTTPResponse respond(HTTPRequest req) {
         System.assertEquals('https://api.stripe.com/v1/coupons', req.getEndpoint());
        System.assertEquals('POST', req.getMethod());
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        res.setHeader('Authorization','Bearer sk_test_FaMZfep2Ay2Tiy5l5v8hI0hO00CcVk6OwP' );
        res.setBody('{"id":"012345"}');
        res.setStatusCode(200);
        return res;    }
}