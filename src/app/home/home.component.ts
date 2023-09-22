import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ngOnInit(): void { //onload
    let addressBookStorageString = localStorage.getItem("addressBook")
    if (addressBookStorageString) {
      this.addressBook = JSON.parse(addressBookStorageString)
      this.addressBook.sort((a: { id: number; }, b: { id: number; }) => a.id - b.id)
      if ((this.addressBook.length >= 1)) {
        this.currentId = this.addressBook[this.addressBook.length - 1].id
        console.log(this.currentId)
      }
      this.nextId()
    }
    // Initialisieren Sie Ihre Datenquelle
    this.filteredData = this.addressBook;
  }

  addressBook: Address[] = []
  currentId: number = 1000100
  savedId: number = 0
  searchQuery: string = "";
  filteredData: Address[] = [];

  search() {
    if (this.searchQuery.trim() === "") {
      this.filteredData = this.addressBook;
    } else {
      // Suchen und aktualisieren von filteredData
      this.filteredData = this.addressBook.filter(item => {
        const searchLower = this.searchQuery.toLowerCase();
        return (
          item.id.toString().includes(this.searchQuery) ||
          item.name.toLowerCase().includes(searchLower) ||
          item.street.toLowerCase().includes(searchLower) ||
          item.plz.includes(this.searchQuery) ||
          item.city.toLowerCase().includes(searchLower) ||
          item.country.toLowerCase().includes(searchLower)
        );
      });
    }
  }

  addAddress() {
    var modal = document.getElementById("add-modal")!;
    console.log("Ausgeführt")
    const name: HTMLInputElement = <HTMLInputElement>document.getElementById("name")! //cast htmlElement to htmlInputElement
    const street: HTMLInputElement = <HTMLInputElement>document.getElementById("straße")!
    const plz: HTMLInputElement = <HTMLInputElement>document.getElementById("plz")!
    const city: HTMLInputElement = <HTMLInputElement>document.getElementById("stadt")!
    const country: HTMLInputElement = <HTMLInputElement>document.getElementById("land")!
    console.log("Klick")
    const newName = name.value
    const newStreet = street.value
    const newPlz = plz.value
    const newCity = city.value
    const newCountry = country.value
    console.log(name)
    if (newName && newStreet && newPlz && newCity && newCountry) {
      const newid = this.autoGenerateId()
      const newAddress = new Address(
        newid, newName, newStreet, newPlz, newCity, newCountry)

      this.addressBook.push(newAddress)
      console.log(this.addressBook)
      this.saveChanges()
      modal.style.display = "none"

      name.value = "";
      street.value = "";
      plz.value = "";
      city.value = "";
      country.value = "";
    } else {
      alert("Alle Daten eingeben!")
    }
  }

  autoGenerateId() {
    if (this.addressBook.length === 0 || this.addressBook.every(address => address.id !== 1000100)) {
      return this.currentId
    }
    this.nextId()
    return this.currentId
  }

  deleteAddress() {
    var modal = document.getElementById("delete-modal")!;
    console.log("Löschen geklickt für ID:", this.savedId);
    // Finden und Entfernen der Adresse aus dem addressBook-Array
    const deleteIndex = this.addressBook.findIndex((address: { id: number; }) => address.id === this.savedId);
    console.log(deleteIndex)
    this.addressBook.splice(deleteIndex, 1);

    //localStorage aktualisieren
    this.saveChanges()
    console.log("Adresse mit ID " + this.savedId + " wurde aus dem addressBook-Array entfernt.");
    modal.style.display = "none"
  }

  copyAddress(address: Address) {
    console.log("Kopieren geklickt für ID:", address.id);
    const copyItem = JSON.stringify(this.addressBook.find((address: { id: number; }) => address.id === address.id))
    console.log(copyItem)

    //Copy to Clipboard
    //unsichtbares Textfeld
    const textArea = document.createElement("textarea");
    textArea.value = copyItem;
    document.body.appendChild(textArea);

    navigator.clipboard.writeText(textArea.value)
      .then(() => {
        console.log("Text copied to clipboard...")
      })
      .catch(err => {
        console.log('Something went wrong', err);
      })

    //Textfeld entfernen
    document.body.removeChild(textArea);


    this.currentEditAddress = new Address(
      address.id,
      address.name,
      address.street,
      address.plz,
      address.city,
      address.country
    )
    console.log("Copy geklickt für Ursprungs-ID:", address.id);

    var modal = document.getElementById("copy-modal")!;
    var span = document.getElementById("close-copy")!;


    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.addEventListener('click', () => {
      modal.style.display = "none";
      console.log("Klickedin")
    })

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }

  addCopyAddress() {
    var modal = document.getElementById("copy-modal")!;

    const newId = this.autoGenerateId()
    const newCopyAddress = new Address(
      newId,
      this.currentEditAddress!.name,
      this.currentEditAddress!.street,
      this.currentEditAddress!.plz,
      this.currentEditAddress!.city,
      this.currentEditAddress!.country
    )

    this.addressBook.push(newCopyAddress)
    this.saveChanges()
    modal.style.display = "none";
  }

  currentEditAddress: Address | null = null
  editAddress(address: Address) {
    this.currentEditAddress = new Address(
      address.id,
      address.name,
      address.street,
      address.plz,
      address.city,
      address.country
    )
    console.log("Bearbeiten geklickt für ID:", address.id);
    var modal = document.getElementById("edit-modal")!;
    var span = document.getElementById("close-edit")!;


    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.addEventListener('click', () => {
      modal.style.display = "none";
      console.log("Klickedin")
    })

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }

  saveEditAddress() {
    var modal = document.getElementById("edit-modal")!;

    this.addressBook.forEach((element, index) => {
      if (element.id == this.currentEditAddress!.id) {
        this.addressBook[index] = this.currentEditAddress!
      }
    });
    this.saveChanges()
    modal.style.display = "none";
  }

  openDel(id: number) {
    var delmodal = document.getElementById("delete-modal")!;
    var cancel = document.getElementById("cancel-delete")!;

    delmodal.style.display = "block";
    this.savedId = id

    cancel.onclick = function () {
      delmodal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == delmodal) {
        delmodal.style.display = "none";
      }
    }
  }

  openAdd() {
    var addmodal = document.getElementById("add-modal")!;
    var span = document.getElementById("close-add")!;
    console.log("Add")
    addmodal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.addEventListener('click', () => {
      addmodal.style.display = "none";
      console.log("Klicked")
    })

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == addmodal) {
        addmodal.style.display = "none";
      }
    }
  }

  nextId() {
    let availableId = 1000100;

    // suchen nach einer verfügbaren ID
    for (const address of this.addressBook) {
      if (address.id === availableId) {
        availableId++;
      } else {
        break; // verfügbare ID gefunden
      }
    }

    this.currentId = availableId;
    console.log(this.currentId)
  }

  saveChanges() {
    this.addressBook.sort((a: { id: number; }, b: { id: number; }) => a.id - b.id)
    localStorage.setItem("addressBook", JSON.stringify(this.addressBook)) //save addressBook in localStorage
    this.nextId()
  }
}



class Address {
  constructor(id: number, name: string, street: string, plz: string, city: string, country: string) {
    this.id = id
    this.name = name
    this.street = street
    this.plz = plz
    this.city = city
    this.country = country
  }

  id: number
  name: string
  street: string
  plz: string //das führende 0 sonst nicht mitgelesen, als nicht signifikantes Zeichen interpretiert
  city: string
  country: string
}
