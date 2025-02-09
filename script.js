document.addEventListener("DOMContentLoaded", function () {
    // HTML-Elemente holen
    const dropdown = document.getElementById("inputSelection");
    const confirmButton = document.getElementById("confirmButton");
    const addressFields = document.getElementById("addressFields");
    const officeFields = document.getElementById("officeFields");

    // Beim Klicken auf "Bestätigen"
    confirmButton.addEventListener("click", function () {
        console.log("Ausgewählte Option:", dropdown.value); // Debugging

        if (dropdown.value === "Abholung") {
            // Adressfelder anzeigen, Geschäftsstelle-Felder verstecken
            addressFields.style.display = "block";
            officeFields.style.display = "none";
        } else if (dropdown.value === "Uebergabe") {
            // Geschäftsstelle-Felder anzeigen, Adressfelder verstecken
            officeFields.style.display = "block";
            addressFields.style.display = "none";
        } 
    });
});
