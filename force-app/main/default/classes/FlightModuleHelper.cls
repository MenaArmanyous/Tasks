public with sharing class FlightModuleHelper {
    //mrthod to get all airports to show in the LWC list.
    @AuraEnabled(cacheable=true scope='global')
    public static List<Airport__c> getAllAirports(){
        try {
            List<Airport__c> airports=[SELECT Id,Name, IATA__c, Location__c FROM Airport__c WITH SECURITY_ENFORCED ORDER BY Name];
            if(airports.size()<2){
                return null;
            }
            else{
                return airports;
            }
        } catch (Exception exceptionHappen) {
            System.debug('Error happen:'+exceptionHappen);
            return null;
        }
    }

    @AuraEnabled
    public static List<Airport__c> searchAirport(String searchTerm){
        //remove leading or trailing spaces of search term.
        searchTerm= searchTerm.trim();
        //return all airports if no search term.
        if(searchTerm == ''){
            return getAllAirports();
        }

        searchTerm='%'+ searchTerm+'%';
        try {
            return [SELECT Id,Name, IATA__c, Location__c FROM Airport__c WHERE IATA__c LIKE :searchTerm WITH SECURITY_ENFORCED ORDER BY Name];
        } catch (Exception exceptionHappen) {
            System.debug('Error happen:'+exceptionHappen);
            return null;
        }
    }
    @AuraEnabled
    public static string createAriport(Airport__c airportRecord){
        try {
            System.debug('record '+ airportRecord);
            insert airportRecord;
            return 'Done';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Map<String,SObject> createFlight(Flight__c flightRecord){
        try {
            System.debug('record '+ flightRecord);
            Airport__c departureAirport=[SELECT Id, Name, IATA__c, Location__latitude__s,Location__longitude__s FROM Airport__c WHERE Id=:flightRecord.Departure_Airport__c WITH SECURITY_ENFORCED];
            Airport__c arrivalAirport=[SELECT Id, Name, IATA__c, Location__latitude__s,Location__longitude__s FROM Airport__c WHERE Id=:flightRecord.Arrival_Airport__c WITH SECURITY_ENFORCED];
            Decimal DistanceKM= calculateDistance(departureAirport.Location__latitude__s,departureAirport.Location__longitude__s,arrivalAirport.Location__latitude__s,arrivalAirport.Location__longitude__s)/1000;
            flightRecord.Distance__c=DistanceKM.setScale(2);
            insert flightRecord;
            
            return new Map<String,SObject>{'departureAirport'=>departureAirport,'arrivalAirport'=>arrivalAirport,'flightRecord'=>flightRecord};
        } catch (Exception e) {
            // throw new AuraHandledException(e.getMessage());
            Schema.SObjectType except = Schema.getGlobalDescribe().get(e.getMessage());
            return new Map<String,SObject>{'error'=>except.newSObject()};
        }
    }
    //method to calculate the distance between two locations.
    static Decimal calculateDistance(Decimal latitude1, Decimal longitude1, Decimal latitude2, Decimal longitude2) {
        Integer earthRadius = 6371 * 1000; // in meters
        // Transform coordinates from degrees to radians
        Decimal latitudeRadians1 = latitude1 * Math.PI/180;
        Decimal latitudeRadians2 = latitude2 * Math.PI/180;
        // Latitude and longitude differences in radians
        Decimal latitudeDelta = (latitude2 - latitude1) * Math.PI/180;
        Decimal longitudeDelta = (longitude2 - longitude1) * Math.PI/180;
        Decimal a = Math.sin(latitudeDelta/2) * Math.sin(latitudeDelta/2) +
        Math.cos(latitudeRadians1) * Math.cos(latitudeRadians2) *
        Math.sin(longitudeDelta/2) * Math.sin(longitudeDelta/2);
        Decimal arc = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        Decimal distance = earthRadius * arc; // in metres
        return distance;
    }
}