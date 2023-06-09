trigger makeDistributionURL on ContentVersion (after insert) {
   System.debug('created');
}