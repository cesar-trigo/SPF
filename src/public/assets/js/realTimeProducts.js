const socket = io();

let ulProd = document.getElementById("prod");

socket.on("newProduct", prod => {
  ulProd.innerHTML += `<li>${prod.title}</li>`;
});

socket.on("deleteProduct", prod => {
  ulProd.innerHTML = "";
  prod.forEach(p => {
    ulProd.innerHTML += `<li>${p.title}</li>`;
  });
});
