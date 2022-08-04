import { LightningElement } from 'lwc';
import getAllAirports from '@salesforce/apex/FlightModuleHelper.getAllAirports';
import searchAirport from '@salesforce/apex/FlightModuleHelper.searchAirport';
import AIRPORT_OBJECT from '@salesforce/schema/Airport__c';
import AIRPORT_FIELD from '@salesforce/schema/Airport__c';
import NAME_FIELD from '@salesforce/schema/Airport__c.Name';
import IATA_FIELD from '@salesforce/schema/Airport__c.IATA__c';
import Latitude_FIELD from '@salesforce/schema/Airport__c.Location__c';
import Longitude_FIELD from '@salesforce/schema/Airport__c.Location__c';
import createAriport from '@salesforce/apex/FlightModuleHelper.createAriport';
import createFlight  from '@salesforce/apex/FlightModuleHelper.createFlight';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// const ariportFields =[AIRPORT_FIELD];
export default class FlightLWC extends LightningElement {
  airportRecords;
  searchTerm;
  departureAirports;
  selectedDeparture;
  selectedArrival;
  arrivalAirports;
  errorMessage;
  airportObject=AIRPORT_OBJECT;
  airportFields=[NAME_FIELD,IATA_FIELD,Latitude_FIELD,Longitude_FIELD];
  
  airportRecord={
    Name:this.airportFields.NAME_FIELD,
    IATA__c:this.airportFields.IATA_FIELD,
    Location__Latitude__s: this.airportFields.Latitude_FIELD,
    Location__Longitude__s:this.airportFields.Longitude_FIELD
  }
  flightRecord;
  flightsLocation;
  selectedAirportLocation;
  flightNumber;
  flightDistance;
  callingApexError;
  departureLatitude;
  departureLongitude;
  arrivalLatitude;
  arrivalLongitude;
  connectedCallback(){
    this.loadAirports();
  }

  loadAirports(){
    getAllAirports().then((result)=>{
        this.airportRecords= result;
        this.departureAirports= result.map(obj=>{
          return{
          label: obj.Name + '('+obj.IATA__c+')',
          value: obj.Id}
        });
        this.arrivalAirports= result.map(obj=>{
          return{
          label: obj.Name+ '('+obj.IATA__c+')',
          value: obj.Id}
        });
    }).catch((error)=>{
      console.log(error);
    })
  }
  /////Search Airport by IATA////////
  termChanged(event){
    this.searchTerm=event.target.value;
  }
  //call Apex helper class to search on ariports.c
  //this method used for departure and arrival selection.
  searchAirport(event){
    if(event.target.name=='departure-search'){
      searchAirport({searchTerm:this.searchTerm}).then((result)=>{
        if(result.length>0){
          this.departureAirports= result.map(obj=>{
            return{
            label: obj.Name + '('+obj.IATA__c+')',
            value: obj.Id}
          });
          this.dispatchEvent(
            new ShowToastEvent({
                title: 'Airport found',
                message: 'Airport found with IATA equal "'+this.searchTerm+'" select one from the departure list.',
                variant: 'success',
            }),);
        }else{
          this.dispatchEvent(
            new ShowToastEvent({
                title: 'Airport not found',
                message: 'No airport found with IATA equal "'+this.searchTerm+'"',
                variant: 'error',
            }),);
        }
        
    }).catch((error)=>{
      this.dispatchEvent(
        new ShowToastEvent({
            title: 'An error happen during the filter search. Please conatact your administator.',
            message: error,
            variant: 'error',
        }),);
    })
    } else if(event.target.name=='arrival-search'){
      searchAirport({searchTerm:this.searchTerm}).then((result)=>{
        if(result.length>0){
          console.log(result);
          this.arrivalAirports= result.map(obj=>{
            return{
            label: obj.Name + '('+obj.IATA__c+')',
            value: obj.Id}
          });
          this.dispatchEvent(
            new ShowToastEvent({
                title: 'Airport found',
                message: 'Airport found with IATA equal "'+this.searchTerm+'" select one from the arrival list.',
                variant: 'success',
            }),);
        }else{
          this.dispatchEvent(
            new ShowToastEvent({
                title: 'Airport not found',
                message: 'No airport found with IATA equal "'+this.searchTerm+'"',
                variant: 'error',
            }),);
        }
    }).catch((error)=>{
      this.dispatchEvent(
        new ShowToastEvent({
            title: 'An error happen during the filter search. Please conatact your administator.',
            message: error,
            variant: 'error',
        }),);
      })
    }

  }

  //set the departure airport
  selectDeparture(event){
    this.selectedDeparture=event.detail.value;
    this.validateFlight();
  }
  //set the arrival airport
  selectArrival(event){
    this.selectedArrival=event.detail.value;
    this.validateFlight();
  }
  //validate the flight before creation.
  validateFlight(){
    if(this.selectedDeparture==this.selectedArrival){
      this.errorMessage='The departure and the arrival airports must be different.';
      this.dispatchEvent(
        new ShowToastEvent({
            title: 'Error adding the flight',
            message: this.errorMessage,
            variant: 'error',
        }),);
    }
  }

//create the flight through Apex helper class.
addFlight(){
  this.flightRecord={
    Arrival_Airport__c:this.selectedArrival,
    Departure_Airport__c:this.selectedDeparture,
  };
  createFlight({flightRecord: this.flightRecord})
            .then(result => {
              console.log('then   '+JSON.stringify(result));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Flight Added',
                        variant: 'success',
                    }),
                );
              //   console.log(result['departureAirport']);
              //   this.departureLatitude=result.departureAirport.Location__latitude__s;
              //   this.departureLongitude=result.departureAirport.Location__longitude__s;
              //   this.arrivalLatitude=result.arrivalAirport.Location__latitude__s;
              //   this.arrivalLongitude=result.arrivalAirport.Location__longitude__s;
              //   this.flightsLocation=[{
              //     location: { Latitude:this.departureLatitude, Longitude:this.departureLongitude },
              //     title: 'Departure Airport '+result['departureAirport'].Name+'('+result['departureAirport'].IATA__c+')',
              //     description: `Coords: ${this.departureLatitude}, ${this.departureLongitude}`,
              //     value:'departure',
              //   },
              //   {
              //     location: { Latitude:this.arrivalLatitude, Longitude:this.arrivalLongitude },
              //     title: 'Arrival Airport '+result['arrivalAirport'].Name,
              //     description: `Coords: ${this.arrivalLatitude}, ${this.arrivalLongitude}`,
              //     value:'arrival',
              //   },
              // ];
              // console.log('flightsLocation'+JSON.stringify(result.departureAirport.Location__Latitude__s));
              // console.log('flightsLocation'+JSON.stringify(this.flightsLocation));
              this.flightDistance=result['flightRecord'].Distance__c;
            })
            .catch(result => {
              console.log('catch   '+JSON.stringify(this.flightRecord));
              console.log('catch   '+JSON.stringify(result));
              this.callingApexError=result;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error adding the airport',
                        message: result['error'],
                        variant: 'error',
                    }),
                );
            });
  }
airportLocationSelect(event) {
    this.selectedAirportLocation = event.target.selectedMarkerValue;
}
//Airport section
  handelAirportNameChange(event){
    this.airportRecord.Name=event.target.value;
  }
  handelAirporIATAChange(event){
    this.airportRecord.IATA__c=event.target.value;
  }
  handelAirporLocationChange(event){
    this.airportRecord.Location__Latitude__s=event.target.latitude;
    this.airportRecord.Location__Longitude__s=event.target.longitude;
  }
  //create airport record.
  addAirport(){

    createAriport({airportRecord: this.airportRecord})
            .then(result => {
              console.log('then   '+JSON.stringify(result));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Airport Added',
                        variant: 'success',
                    }),
                );
            })
            .catch(result => {
              console.log('catch   '+JSON.stringify(this.airportRecord));
              console.log('catch   '+JSON.stringify(result));
              this.callingApexError=result;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error adding the airport',
                        message: result.body.message,
                        variant: 'error',
                    }),
                );
            });
  }
}