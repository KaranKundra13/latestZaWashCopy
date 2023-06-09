trigger discountCoupons on Discount_Coupons__c (after insert, after update) {

    list<string> couponId=new list<string>();
    list<string> couponIdscountries=new list<string>();
    for(Discount_Coupons__c dc :trigger.new){
        couponId.add(dc.id);
        couponIdscountries.add(dc.Coupon_For_which_Stripe_Account__c);
    }
    if((Trigger.isInsert&&!stripeIntegrationHepler.hasRunOnce) || (Trigger.isUpdate&&!stripeIntegrationHepler.hasRunOnce)) {
        stripeIntegrationHepler.createStripeCoupon(couponId, couponIdscountries);
    }
}