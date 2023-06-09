global class odooCalloutMockCustomer implements HttpCalloutMock {
    global HTTPResponse respond(HTTPRequest req) {
         System.assertEquals('https://zawash-dev.dator.lu/api-integration-sf/api-integration-sf', req.getEndpoint());
       //   System.assertEquals('https://www.zawash.ch/api-integration-sf/api-integration-sf', req.getEndpoint());

        System.assertEquals('POST', req.getMethod());
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
               res.setBody('{"result":"102"}');

        res.setStatusCode(200);
        return res;    }


}