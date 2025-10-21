const signup = document.querySelector(".sign_up")
const loginContainer = document.querySelector(".login-container")
signup.addEventListener('click',()=>{

loginContainer.innerHTML=`

 <h1> Sign up</h1>

            <div class="innerContainer">

              <form action="text">

                <input type="text" placeholder="username">
                <input type="password" placeholder="Password">
                <input type="password" placeholder="Confirm password">
                <input type="text" placeholder="gmail">
                <input type="password" placeholder="otp">

                <button type="submit">Sign up</button>



              </form>
      <p class="reload">login</p>

            </div>

`
const loginReload = document.querySelector(".reload")

loginReload.addEventListener("click",()=>{

location.reload();


})

})

