import Head from 'next/head';

const get_cookie = (name) => {
    if(!process.browser) return;
    
    let name_eq = name + "="
    const cookies = document.cookie.split(";")
    for (var i = 0; i < cookies.length; i++) {
      let c = cookies[i]
      while (c.charAt(0) == " ") c = c.substring(1, c.length)
      if (c.indexOf(name_eq) == 0) return c.substring(name_eq.length, c.length)
    }
    return null
}

const darklight = () => {
    if(!process.browser) return;

    const theme = get_cookie("theme");
    let cookie_theme = "";

    if (theme == "dark") cookie_theme = "theme=light; Path=/";
    else cookie_theme = "theme=dark; Path=/";
  
    document.cookie = cookie_theme;
}

const init = () => {
    if(!process.browser) return;
    
    document.addEventListener('DOMContentLoaded', () => {
      const theme = get_cookie("theme")
      if(theme === "light") {
        document.getElementById('white').checked = true;
      } else {
        document.getElementById('dark').checked = true;
      }
    })
}

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <input type="radio" id="white" name="colors" value="white" onChange={() => darklight()} />
            <input type="radio" id="dark" name="colors" value="dark" onChange={() => darklight()} />
        
            <div className='container'>
                {init()}
                <div class="color-palette">
                    <label for="white"></label>
                    <label for="dark"></label>
                </div>

                <Component {...pageProps} />

                <style jsx global>{
                    `
                    :root {
                        --white-bg-color: #fff;
                        --white-text-color: #000;
                    
                        --dark-bg-color: #23272a;
                        --dark-text-color: #fff;
                    }

                    html,
                    body {
                    padding: 0;
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                        Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                        sans-serif;
                    }

                    * {
                    box-sizing: border-box;
                    }

                    .container {
                        transition: all 0.3s ease-in-out;
                    }

                    [type="radio"] {
                        position: fixed;
                        left: -9999px;
                      }
                       
                      label {
                        cursor: pointer;
                      }

                    [id="white"] ~ .container [for="white"] {
                        background: var(--white-bg-color);
                    }
                    
                    [id="dark"] ~ .container [for="dark"] {
                        background: var(--dark-bg-color);
                    }

                    .color-palette {
                        position: fixed;
                        top: 30px;
                        right: 15px;
                        display: grid;
                        grid-row-gap: 10px;
                        padding: 10px;
                        border-radius: 20px;
                        background: rgba(0, 0, 0, 0.4);
                    }
                    
                    .color-palette label {
                        position: relative;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                    }
                    
                    .color-palette label::before {
                        display: none;
                        content: "";
                        position: absolute;
                        top: 50%;
                        left: -30px;
                        transform: translateY(-50%);
                        width: 10px;
                        height: 2px;
                    }

                    [type="radio"]:checked ~ .container label::before {
                        display: block;
                    }
                    
                    [id="white"]:checked ~ .container {
                        color: var(--white-text-color);
                        background: var(--white-bg-color);
                    }
                    
                    [id="white"]:checked ~ .container [for="white"]::before {
                        background: var(--white-text-color);
                    }
                    
                    [id="dark"]:checked ~ .container {
                        color: var(--dark-text-color);
                        background: var(--dark-bg-color);
                    }
                    
                    [id="dark"]:checked ~ .container [for="dark"]::before {
                        background: var(--dark-text-color);
                    }
                    `
                }</style>
            </div>
        </div>
    )
}
  
export default MyApp