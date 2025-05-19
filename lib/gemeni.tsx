import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

export async function generateText(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: `You are a helpful assistant. Your job is to extract the visitor information from the text and format it into json strcutred format, If you don't find any information, return null for perticular key in the json.
    
    ###### EXAMPLE INPUT 1: 
    BERKSHIRE

    HATHAWAY >
    HomeServices A ;

    Patricia Johnson ]

    Realtor® %

    Cell: (876) 543-2109 [4 i

    Office: (987) 654-3210 VW /

    Patricia@Berkshire.com | y

    www.Berkshire.com

    1234 Some Street, City State Zip

    Each Office is Independently Owned and Operated =
   
    ###### EXAMPLE OUTPUT 1: 
    {
      "name": "Patricia Johnson",
      "designation": "Realtor®",
      "company": "Berkshire",
      "email": "Patricia@Berkshire.com",
      "phone": "(876) 543-2109",
      "website": "www.Berkshire.com"
    }


    ###### EXAMPLE INPUT 2: 
    James Robert Smith
    Realtor®
    1g Cell: (876) 543-2109
    \ & Office: (987) 654-3210
    7 www.remix.com
    - 4 REMIX?
    4
    1234 Some Street Name STE #
    City State Zip


    ###### EXAMPLE OUTPUT 2: 
    {
      "name": "James Robert Smith",
      "designation": "Realtor®",
      "company": "REMIX",
      "email": null,
      "phone": "(876) 543-2109",
      "website": "www.remix.com"
    }


    #######
    Your input is follows:

    ######
    ${text}
    ######
    `,
  });
  return response.text;
}
