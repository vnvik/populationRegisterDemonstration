package cit.mintrud.populationRegister.controller;


import cit.mintrud.populationRegister.model.CustomError;
import cit.mintrud.populationRegister.model.RNResponse;
import cit.mintrud.populationRegister.model.User;
import org.json.JSONException;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.*;
import java.io.IOException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.HashMap;

@Controller
@PropertySource(value = {"classpath:application.properties"}, encoding = "utf-8")
public class MainController {

    @Value("${pathToGetData}")
    private String pathToGetData;
    @Value("${loginToGetData}")
    private String loginToGetData;
    @Value("${passwordToGetData}")
    private String passwordToGetData;

    @GetMapping("/getDataRN")
    public String getData(@AuthenticationPrincipal User user, Model model){
        model.addAttribute("isAdmin", user.isAdmin());
        model.addAttribute("user", user);
        return "getDataRN";
    }

    @PostMapping("/cloud/Response")
    @ResponseBody
    public Object RNResponse(@RequestBody String bodyCrypto) throws NoSuchAlgorithmException, KeyManagementException, ParseException, JSONException, IOException {

        TrustManager[] trustAllCerts = new TrustManager[] {new X509TrustManager() {
            public X509Certificate[] getAcceptedIssuers() {
                return null;
            }
            public void checkClientTrusted(X509Certificate[] certs, String authType) {
            }
            public void checkServerTrusted(X509Certificate[] certs, String authType) {
            }
        }
        };
        SSLContext sc = SSLContext.getInstance("SSL");
        sc.init(null, trustAllCerts, new SecureRandom());
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        HostnameVerifier allHostsValid = new HostnameVerifier() {
            public boolean verify(String hostname, SSLSession session) {
                return true;
            }
        };
        HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
        String test = bodyCrypto.replace("\n", "");
        HttpHeaders headers = new HttpHeaders();
        RNResponse rn = new RNResponse();
        rn.setUsername(loginToGetData);
        rn.setPassword(passwordToGetData);
        rn.setCms(bodyCrypto.replace("\n", ""));
        headers.add("Accept", MediaType.APPLICATION_JSON_UTF8_VALUE);
        headers.setContentType(MediaType.APPLICATION_JSON_UTF8);
        headers.set("Authorization", "******");
        ResponseEntity<String> answer = null;
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpEntity<RNResponse> requestBody = new HttpEntity<>(rn, headers);
            answer = restTemplate.postForEntity(pathToGetData, requestBody, String.class);
            HttpStatus status = answer.getStatusCode();

        } catch (Exception ex) {
            ex.printStackTrace();
            return new CustomError(1, ex.getMessage());
        }

//        JSONParser parser = new JSONParser();
//        JSONObject obj = (JSONObject)parser.parse(answer.getBody());
//        HashMap response = (HashMap) obj.get("response");
//        JSONArray personal_data = (JSONArray) response.get("personal_data");
//        JSONObject arrayPersonal_data = (JSONObject) personal_data.get(0);
//        HashMap data = (HashMap) arrayPersonal_data.get("data");
//        HashMap<String, String> sendData = new HashMap<>();
//        sendData.put("identif", (String) data.get("identif"));
//        sendData.put("surname", (String) data.get("last_name"));
//        sendData.put("name", (String) data.get("name"));
//        sendData.put("patname", (String) data.get("patronymic"));
        return answer.getBody();
    }



    @GetMapping("/sendDataRN")
    public String sendData(@AuthenticationPrincipal User user, Model model) throws IOException, InterruptedException {
        model.addAttribute("isAdmin", user.isAdmin());
        model.addAttribute("user", user);
        return "sendDataRN";
    }

}
