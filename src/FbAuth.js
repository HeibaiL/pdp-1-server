import {useEffect} from "react";

const REDIRECT_URL = 'http://localhost:3000/auth';


function FbAuth() {
    useEffect(() => {
        if (window.location.href.includes('code')) {
            const firstEqualSign = window.location.href.indexOf('=') + 1;
            const firstAmpersandSign = window.location.href.indexOf('&') - 3 ;
            const code = window.location.href.slice(firstEqualSign, firstAmpersandSign);
            console.log(code, window.location.href)

            fetch('http://localhost:3004/api/fbLogin', {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({code})
            });
        }
    }, []);

    const link = `https://www.facebook.com/v12.0/dialog/oauth?client_id=835926030429331&redirect_uri=${REDIRECT_URL}`
    console.log(link, 'qq')
    return (
        <div className="App">
            hello
            <a href={link} target='_blank' rel='noreferrer'> here </a>
        </div>
    );
}

export default FbAuth;
