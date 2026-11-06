export interface GpsPhoto {
  id: string;
  fileId: string;
  originalUrl: string;
  thumbnailUrl: string;
  highResUrl: string;
  lh3Url: string;
  ucViewUrl: string;
  embedPreviewUrl: string;
  recordId: string;
  indexInRecord: number;
  tehsil: string;
  unionCouncil: string;
  chakMouza: string;
  timestamp: string;
  dateFormatted: string;
}

export interface SurveyRecord {
  id: string;
  rowNumber: number;
  timestamp: string;
  datePart: string;
  timePart: string;
  dateFormatted: string;
  sortTimestamp: number;
  tehsil: string;
  unionCouncilRaw: string;
  ucNumber: string;
  ucName: string;
  chakMouzaRaw: string;
  chakMouzaClean: string;
  photos: GpsPhoto[];
  photoCount: number;
}

export const PERMANENT_GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/199OwKQAdrDMENa2Ct8htmyk1sj8DY3WfK6K-jni-P7w/edit?usp=sharing';

export const ATTACHED_CSV_ASSET_PATH = `${import.meta.env.BASE_URL}assets/aistudio/Areas_31.10_33ba403b.2026__Responses_`;

export const RAW_SURVEY_CSV = `Timestamp,Tehsil,Union Council,Name of Chak/Mouza,Attach GPS Pictures
10/31/2026 13:54:32,18-Hazari,83. UCH GUL IMAM,Burzi Wala Chak NO.11/3 UC Uchgulimam ,https://drive.google.com/open?id=1SRqGyHWk4GB5sqkjm4FWCxdmY-Cntk-K
10/31/2026 14:42:49,Jhang,20. CHAK GHUMNANA,Kaluwala ,"https://drive.google.com/open?id=1Th8_IrzPfnwgrIfrJfhe8q5vpBmy0_GB, https://drive.google.com/open?id=1t56igzhSrz4T6NdG2Miu3mvcw3Namo53"
10/31/2026 14:48:12,Jhang,38. RATA MATA SHUMALI,BALI,https://drive.google.com/open?id=1VHgYm9KfjUNLMAv2NN_xDb4GhpuRYXHX
10/31/2026 15:01:41,Jhang,31. MASSAN,CHAK SAID BEHRAM,https://drive.google.com/open?id=1J6axMMpO4cK1RakOKyMI-Uo9n6bss6JX
10/31/2026 15:15:41,Jhang,23. CHAK NO. 463/JB,CHAK 463,https://drive.google.com/open?id=1tXkdQF6znEzXwKJ7qXxHd2Gxn3EWhwTF
10/31/2026 15:43:16,Jhang,13. SHEIKH CHOHAR,Chak Koriana Shumali,https://drive.google.com/open?id=1iclde8s9Af1GpffvI1IxfvDnQWF9srsA
10/31/2026 15:45:01,Jhang,16. KOT SAI SINGH,chak no. 268,"https://drive.google.com/open?id=1PXuMf72EHfB5nfI14lyIVS8K3Qz-TdrR, https://drive.google.com/open?id=1QEQH43273uxx4DM3E8CjOyNiegRsNT97, https://drive.google.com/open?id=1oESkoDx4iYD3BhcLXp4CJk9-S0puVOPl"
10/31/2026 15:48:57,Jhang,16. KOT SAI SINGH,chak no. 269,"https://drive.google.com/open?id=1cStvjLAs3De4Gbp97DSYjwpXHzTjrHO4, https://drive.google.com/open?id=1XzGFzdOUp0Vwz31VXe3jrIJFSZ7TfN3c, https://drive.google.com/open?id=1i51TxrG_e5rdqM-nmopoRfKNozDu-MmU, https://drive.google.com/open?id=1NSCMfIlGjg-mLMexeXPeeeTnBkmXJUN9"
10/31/2026 16:25:46,Ahmad Pur Sial,65. HASSU BALAIL,Hassu balail,"https://drive.google.com/open?id=1opnO20cxPHtOAU8caI9z7t1X-LOJbq7S, https://drive.google.com/open?id=1z6EZbyt7noRZK57teFrM_WFd9YgnzwOe, https://drive.google.com/open?id=19Xu-Y3qWGEqMP1ip9WNtNnyMljHg5JYC, https://drive.google.com/open?id=1QqubjRPVPQmvtLLvf8ksoA9BO8e7JTnN, https://drive.google.com/open?id=1IUI6MGZZGhOqfJqXSbTXai-qRHsbpruK, https://drive.google.com/open?id=1eHSYDgA0tNiscItSD4z1pbV8lzDKa25x, https://drive.google.com/open?id=11dVPq5QAJ668QTVUr8DjPSvJKPQxCXMi, https://drive.google.com/open?id=1K-aT4JQVkp6ZTZ23og3Cy_uMhyg9_dns, https://drive.google.com/open?id=19BE_wNm5sIsMzysAv2xx1zZ5Kk9UqSgt, https://drive.google.com/open?id=1YhvLkVcsruffsNV634FY9SMnSAL6ZLg9"
10/31/2026 22:13:25,Jhang,22. BAGH,Chak No 505/506,"https://drive.google.com/open?id=1vDJsqYCP1HoZJUCmEZW-gCv5dmG0LKLS, https://drive.google.com/open?id=1dQz3RKf8BYdXHsmAl_7BnD1pccq-SKgc, https://drive.google.com/open?id=1tFTcduYMofSUFp38U5BMd05_CWP9ykVU, https://drive.google.com/open?id=1LrAWAQXJ6IUhD04T59juplgRSoRrxfCd, https://drive.google.com/open?id=1p9rPzMzjT9i3LID1cM9XIDj_DYlP5KxA, https://drive.google.com/open?id=1mVNovF6WJCbRUMFOxvPmY6h9Y747hTCo"
10/31/2026 22:37:21,Jhang,22. BAGH,Bagh,"https://drive.google.com/open?id=12SFSgxPCIsCUtx-ME56HX21yBIpSFNEY, https://drive.google.com/open?id=1K5KzvuIQqNyST96J5hYNfSSFd6R_VZKL, https://drive.google.com/open?id=1aX8KC0qYjDV6MoVbLjN0ImdUwtkFHXKI, https://drive.google.com/open?id=1QBJxfR1wfaGyLy-U-JPZrdbLGaiXtUdo, https://drive.google.com/open?id=1AaSkPIODpF9jaRAyq8yhaT5j2i-CY43w, https://drive.google.com/open?id=18lagE2sYn4VETKDrhaFMSBH7JMIOpxcX, https://drive.google.com/open?id=1Y4V5mLDvAQzrz3qcia3VYNTpMDS-NJVR, https://drive.google.com/open?id=1PvIt0EGjuJ9THNQhQ37aJAmOPpXqt33v"
11/2/2026 12:54:44,18-Hazari,90. 7/2 THAL SHUMALI,kot shakir,"https://drive.google.com/open?id=1evlmMJfTUoJhOc2dtK8N7Udglye5jrCx, https://drive.google.com/open?id=1ToCYMHqCi6LrYHsIzBJ9R2Rq2b8CYP-e, https://drive.google.com/open?id=1jMWWbAgyXx1SLcAtjWE_yzAGWhlXv45i, https://drive.google.com/open?id=1tjQfiFvgVkHtm-sWjcR3PgrRX0GwXk8i, https://drive.google.com/open?id=1_lgTfmuNQdxwVHr8oaRDP7AViPDqq6Is, https://drive.google.com/open?id=1qGiZDbRXo329Qb1kBLA5KRqJyKkeZ3k5, https://drive.google.com/open?id=1gueNBtT9HUzh66nFBbAUKoVMZ2WnOaTJ, https://drive.google.com/open?id=1M5CunooE6MLkGPJCzdnTSuZHDGBSaeZO, https://drive.google.com/open?id=1Z7kqMElFeH5pngNMZYp-z2iDZV2RsJEX, https://drive.google.com/open?id=1YaU53XqoB3Bs6wXNSyvBNUeiH49y2a5a"
11/2/2026 13:29:16,18-Hazari,82. RODU SULTAN,Rodu sultan ,https://drive.google.com/open?id=1mlkQmDhxANDJ6l045qQofRj3XWKGlDtd
11/2/2026 13:30:47,Jhang,25. LAK BADHAR,Lak badder,"https://drive.google.com/open?id=1X6Vkg8P6OMmuEw1AfnHrXGMiKKCj4TYJ, https://drive.google.com/open?id=1cZMtZqgL9EPNa4ue29Ph3ZL6YDHCfQhH"
11/2/2026 13:35:45,Jhang,35. CHUND BHARWANA,Chund bharwana,https://drive.google.com/open?id=10FkBLxJopJkkH2pygSy0f0Kf7IMfu8nv
11/2/2026 13:44:21,18-Hazari,82. RODU SULTAN,Rodu sultan ,"https://drive.google.com/open?id=1lp97SMGw11XyVhZ5f6y-hIfjRP6U5OOT, https://drive.google.com/open?id=1eATt1RamLvNqAj9r5d9pqW7VIfr3gIF2, https://drive.google.com/open?id=1K9KXoEjyrT4jQM1SaBffqfkysRIXYUc5, https://drive.google.com/open?id=1NMn9Qk51ZNHzrgIyjEKL5FdM-CN5SZP0, https://drive.google.com/open?id=1l-VMNWgnxGw269yXaVIYf4q8_zMY1Kgr, https://drive.google.com/open?id=1oDwmHDHxpeqK5wcIpHJx4_SFxb8DvOCY, https://drive.google.com/open?id=1d0Vs9vA7op7xFvI-f3M-fQNTxvWj53IZ, https://drive.google.com/open?id=1wkvR8_jesgfBjw79Uh63LfTfmIYT4rFv, https://drive.google.com/open?id=1eqzyv8nNFIye1p41KLvfs0fbhwUqbR7H, https://drive.google.com/open?id=18b3i7uYnorytLq_tJo8m3b4shHHy8ean"
11/2/2026 14:00:12,Jhang,41. MAHAR WALI,Mohar wali ,"https://drive.google.com/open?id=1_39aSt9m7fmZy6OVHBFUwWjc9dDVT8aq, https://drive.google.com/open?id=1agnunOhdQ7r7amUGxdUV754bixro1CON, https://drive.google.com/open?id=1KhIoAZuhWzXxb-BR9w8xGtgRSv8AUHa0, https://drive.google.com/open?id=1_EaNRUlWfsMhm5zgzN_uOvkoCJJ1L6OC, https://drive.google.com/open?id=1KkM36kIA6vbHOpV9SyGZj7wPqxuoj3xj, https://drive.google.com/open?id=1BlZEPpucWL84AEwkKxxrAA4ORSDodoJS, https://drive.google.com/open?id=14eAhaTLXjoD1AfRS58kmMZ7WpbNhVsWN, https://drive.google.com/open?id=1hMzaHKSMs6sMwjriYO_8-Eo6yvlQ9yX1, https://drive.google.com/open?id=13uU15rfgzqUM123eOPPYC24YRudFq9Sh, https://drive.google.com/open?id=1gPDx_DYlTJ16FN-2KOYrU0Wxq52jqIlx"
11/2/2026 14:08:36,Jhang,31. MASSAN,Massan ,https://drive.google.com/open?id=19rxRo5eVEgl8S6lvh9PJeIL1e3DkxSLq
11/2/2026 14:21:05,Jhang,08. MUKHIANA,Chak no 261,"https://drive.google.com/open?id=1O5gUbZbLa14arLBotpMEyUXTamlu2RGv, https://drive.google.com/open?id=1xkg2UHOiNAphuSKjt9Fd4toL16Aojygc, https://drive.google.com/open?id=1O5dSYpYui0slHPmXCdzWtEtWv_NujYNI, https://drive.google.com/open?id=1yp2zlQBq5ituzZf4ZJoP4GI455WRTnZn, https://drive.google.com/open?id=1v_Q_WXEzQNkrefqMBAz_kt-RjLMtqjL1, https://drive.google.com/open?id=1kCXiuOnVkRKfRMcIrJP9vcEoUqev56Ek, https://drive.google.com/open?id=1B8eFfvxS1tc89iCHFKXRjETdgyKIlbSj, https://drive.google.com/open?id=1JLlT64Rkw-cv9carjywxWCzL5bZWzbCs, https://drive.google.com/open?id=1yUa1jm1bOuAddI0hEoYWWuy1g6OterFW, https://drive.google.com/open?id=1L68GW-5i5Lfd9E4cisjnSP-_vrvjOM5X"
11/2/2026 14:27:17,Jhang,38. RATA MATA SHUMALI,Rata mata ,https://drive.google.com/open?id=1p344QLhScvKaQxcXn9YvybeGpB7bqoy1
11/2/2026 14:37:29,Jhang,23. CHAK NO. 463/JB,Chak 440 ,https://drive.google.com/open?id=1uh6RNFc3qRGQmeqZoUCIs2vfKQKU4mdo
11/2/2026 14:42:02,Jhang,19. BASTI GHAZI SHAH,Basti ghazi shah ,"https://drive.google.com/open?id=1q_drX35tFtSN3C8DR-sXqeY3rGk8cU9g, https://drive.google.com/open?id=1MmxfP2rfqAx4U0wPC0WjNh5f1crswDgC, https://drive.google.com/open?id=1HNOBuqxNaJJR3x5NewwKqTRQPjxZM7Xx, https://drive.google.com/open?id=1LrjAwWJpaX4RqeEzVh2pEGeYmOPfpqpT, https://drive.google.com/open?id=1IQwppofGNVMduSZoAs5lF5ErfaIY7eks, https://drive.google.com/open?id=1yX0-5sCKqF9ziGHDLBGkChVFfMx3lU4O, https://drive.google.com/open?id=1_cTAQ97kwqJPmvEFgsZ-tWGhNJoesqFI, https://drive.google.com/open?id=1w6tjk-2C5G_OXee_oniK0RrpvWGZ3lrx, https://drive.google.com/open?id=19AYqK5xyWfsrhHLzMs7Xb3kMZfwK_UL-, https://drive.google.com/open?id=1bBPPEuq1Gl7XTGKrsfG1Y6EI1TpFLpe-"
11/2/2026 14:47:54,Jhang,16. KOT SAI SINGH,chak no. 270,"https://drive.google.com/open?id=1GiSCJZlGzxwIYLqX0mNj-Zycun_kaCyF, https://drive.google.com/open?id=1MS46Trx01n3tH821z7AWHgYK4OlGwk7J, https://drive.google.com/open?id=1Vszt-jBTNjLW357OnkVA6eSum3LhcN12, https://drive.google.com/open?id=1lICxgXS7bFvi3WEkM0PLduDxrMhCX0cW, https://drive.google.com/open?id=1V-reV8gLNCccZZnJIlJPytyCAgDCQCBC"
11/2/2026 14:53:04,Jhang,19. BASTI GHAZI SHAH,Basti ghazi shah ,"https://drive.google.com/open?id=1khR5hACPoE5gou-48kZgsZDif2q5UKtz, https://drive.google.com/open?id=1Ww6g2aSLuoTVFIPsS6wqUqj3_f6Od3ej, https://drive.google.com/open?id=11uBDiMKjdKbo4Nxxh9zwi7hm_77aij7a, https://drive.google.com/open?id=1J6HGPU_S5YRtC9qfRBoTxyEiyq9Snzdd, https://drive.google.com/open?id=1eK6IOSDTowiBMdtmoDu1oCXyYUzavnRp, https://drive.google.com/open?id=1mPkq4ddAdBDybD5P-Q-5OaOxihcDe8Mb, https://drive.google.com/open?id=1oZBeAi0eyRrXIJtJOi0uDNUd0liNic3m, https://drive.google.com/open?id=1lk9SilNvOs8T1sFIageBulUIjt5u3sIF, https://drive.google.com/open?id=1nFVnzIvYR276qbew2i5ldwhzTVWOGBsw, https://drive.google.com/open?id=1mW8qk0PFaUj3kkIW-Hr2R4l0iXRevqZq"
11/2/2026 14:57:16,Jhang,19. BASTI GHAZI SHAH,Basti shah shakoor,"https://drive.google.com/open?id=1aviGakguFvJFS5ikXnO435sA5TlfBGC2, https://drive.google.com/open?id=1eviZGVdjKbGJ3E8r7Sz7Htw5fSIBEBY2, https://drive.google.com/open?id=169C6UzoIwn6xa7M61AGp8n4CBi2mKI0q, https://drive.google.com/open?id=17RYCDfLPToe1hn3yGO3RsKt_3JhUrKZJ, https://drive.google.com/open?id=1BZXwN6_4Z9kZEx9bRo21Cvwb5YTF6VwW, https://drive.google.com/open?id=1jypmIlJmHYVKzLCgLg0FhkySX75JODFC, https://drive.google.com/open?id=1WPCQuxuq1cc3TdEXdwMUHouuIbIXGzRX, https://drive.google.com/open?id=1tfgz9L9VRl5VqF-aj4ptRPRz7vhHVUos, https://drive.google.com/open?id=1bSCrfnu3ZD56hFnqzQwv6fQFwpvsACCh, https://drive.google.com/open?id=1JpWhSPnp1B0vVr1kF_eKg7qaA92oAlVe"
11/2/2026 15:32:00,Jhang,40. KARI WALA,ratta matta janubi,"https://drive.google.com/open?id=1fja0jYF8yX6iT6NSZP79FaGbil1BSDwa, https://drive.google.com/open?id=177fcmIS9DGy7W8euG79kme5BgNu8xgC-, https://drive.google.com/open?id=1PHIPjNj8-kfAgGQZQAVxwUZxLDC_o17D, https://drive.google.com/open?id=1FdVWTgDK9egWSXK5xjwMuREWvygjlojc"
11/2/2026 15:37:49,Jhang,10. CHAK NO. 450/JB,Chak No 416,"https://drive.google.com/open?id=10fPzdXsIxMGGIKcM7Voh5_dY9odg5KPL, https://drive.google.com/open?id=1l-V-G6Bx4ijIIABc60BroPdLrb9B0Wwg, https://drive.google.com/open?id=1i3FDAuI6fTE2KuXHYuPIgnS_qL-HeNtw"
11/2/2026 15:40:24,Ahmad Pur Sial,67. KOT BAHADUR SHAH,KOT BAHADAR shah ,https://drive.google.com/open?id=1MarglEIELAW_5by5hUSH3NlayrC3qGq2
11/2/2026 17:46:09,Jhang,44. KOT ESA SHAH,Bhone,"https://drive.google.com/open?id=1Gxi9u056IGMyjMb92wdDeKnfDf1Z1A1_, https://drive.google.com/open?id=19C8vEA5CNVZdnPivqTuvMoxOYg4qB2zV, https://drive.google.com/open?id=1VKavHBuZ2cQWH99Hx9rURoDSm8WguEmf, https://drive.google.com/open?id=14whyXtqc-WXefxk7ytdsHOGQYQ757EQ4, https://drive.google.com/open?id=1HGorz1vPFIKhg0yRRw91E30o4ErDg6tg, https://drive.google.com/open?id=1U3D7RSiIgklZzGg3o5H1j6zqTHMiOppB, https://drive.google.com/open?id=1RJWDaIqiiTAT0tLUHrmDeexXY8M2MyjT, https://drive.google.com/open?id=12i9fJUiZcMg98V4YHxnxTiUT4Cq_AveR, https://drive.google.com/open?id=1-T-yVi7lf0pDGyuIN2lAO0Byls4-cJa6, https://drive.google.com/open?id=1QpfY_PGO_3Sf30JCjiRNUoh8ZxYlNeqC"
11/3/2026 9:27:59,Jhang,07. SULTAN PUR,Sultan pur,"https://drive.google.com/open?id=1Ho2lHRMk4T_3a9K_iqm3J8cPeGubA5JE, https://drive.google.com/open?id=1b-4ZO-MHrzvOFHH3uSUIbQOQ2kpOSmvS"
11/3/2026 10:27:42,Jhang,18. CHAK NO. 446/JB KHOI ADDA,451,"https://drive.google.com/open?id=1x8azxtfEBHFroFHHIkzWpmrxY1gYOOof, https://drive.google.com/open?id=1CL0J87fBt7yvmM0HU1PjvXp7RiHqKqcO, https://drive.google.com/open?id=1HRxUAh6sQqNhTit88TY05EEAwHMvha4u, https://drive.google.com/open?id=1cub900IQxExkyMoLoYpBm8wfA-7Eq1Hc, https://drive.google.com/open?id=1xsGL9HCK43XWpGX2wyTJQk3CAGXQiU0H, https://drive.google.com/open?id=1hWILcGndf4z9XKqnXzzxUPViMAgaaUj7, https://drive.google.com/open?id=1TmFYP3jdevJIqq8DdWTK96R3OJ9jqA7K, https://drive.google.com/open?id=1QY0QQFcQwo66nhEjhlGPiE4KKYVmuLe1, https://drive.google.com/open?id=1m-VTVrRa6SI9x_jbH1LCHNxNgvrxKKeg, https://drive.google.com/open?id=1yH-UQirdvrw7dnOCY35Q7P5jvnfqU340"
11/3/2026 10:41:25,Jhang,27. MANSOOR SIAL,Dhoeen muhammad,https://drive.google.com/open?id=1bwydbYhkRo2h8zIkhDpK51tZxqoIEXSM
11/3/2026 10:48:18,Jhang,28. QADEEMI,Baghri ,"https://drive.google.com/open?id=1nrwL4I1RCe_nsfVzqNsRzUePUE6TOUuk, https://drive.google.com/open?id=1e__EQVljgHocslZv17mKF2VFEZvjoN3u, https://drive.google.com/open?id=1XYD8929odt-XskDzEfJhoArj2Z1Pj4w_"
11/3/2026 10:52:43,Jhang,28. QADEEMI,Qadeemi,"https://drive.google.com/open?id=18Ku5tiely6jhy1t6gmXO_rrylegtgCGO, https://drive.google.com/open?id=16RSDD5Zc2bHpsDqElCLVbB9XNeRElint, https://drive.google.com/open?id=1s3aumhMySTaZmHO9XbrTrOlc9REhyxzH, https://drive.google.com/open?id=1ZJIWWWYVPsjspG7_VLbQ6TejrNEI_cNA, https://drive.google.com/open?id=186HtXHAe_Hvd82rlZA4vxxi_9q9ROQpU, https://drive.google.com/open?id=18U6MrY_agWcci2aQB_P34_BzCk1qNqS2, https://drive.google.com/open?id=1vcELG3C_WbP3G338bYmYHrI20iUUEwCx, https://drive.google.com/open?id=1kRMW3N4Ayo0F9UXhK8UBWFj13V3Yx_3g"
11/3/2026 10:56:07,Jhang,28. QADEEMI,KOT DEWAN,"https://drive.google.com/open?id=1S3RVBhMioiBz2WA153jHRJSW0WSFyejW, https://drive.google.com/open?id=1vyjFBD1iZnZNq3vOI5KPtDLsQCR5CtkT, https://drive.google.com/open?id=1jaYX3mIPE3ka5Jy8wtbY3fGUHia-A85x, https://drive.google.com/open?id=1kh77dCwJWeOTgYaxUn5mzGlUDj-6hGhh, https://drive.google.com/open?id=1qgpqLIJlOm8tRo-mGYzxFy4NUPpWFtS8, https://drive.google.com/open?id=1flTY2KzTbKj3HjwVNS-Usckf5T8izTnP, https://drive.google.com/open?id=1oeHq-wOqL3NztIh2mDM7kHcXNPrbTGeh, https://drive.google.com/open?id=1dYmmqg0A7LowEM3jHgYrPYbVYb9fLoeC, https://drive.google.com/open?id=1OKK8JsU2iYjfO72H1nMbLRjN-Y75zB2q"
11/3/2026 11:18:47,Jhang,07. SULTAN PUR,Sultan pur,https://drive.google.com/open?id=1AnvGjUVNXBLwr4bCL35_cFLyJ405jRnR
11/3/2026 11:20:14,Jhang,07. SULTAN PUR,Sultan pur,https://drive.google.com/open?id=1Pr6cLIFpQ-GRIQljsQJDQOOIDG010qi-
11/3/2026 12:15:52,Jhang,40. KARI WALA,kari wala,"https://drive.google.com/open?id=1zouMX4WUNx10-SC-lcoiFqQWdJTmseR8, https://drive.google.com/open?id=1o8Bs59cwWu0YJyF7_hoQN_f5LAnMRNuO, https://drive.google.com/open?id=10z_cmB2YNJcHa_UQPszYu6Kwe463aIcO, https://drive.google.com/open?id=1mq03x8gLzaU3Av_TqxN7OxbkB-VG8rcq"
11/3/2026 12:19:40,Jhang,40. KARI WALA,ghori wala,"https://drive.google.com/open?id=1BDO4puSux9hHsFHNJZBd-k3mlKYGCAQJ, https://drive.google.com/open?id=1Oer9CxDzF_3cWnO2JOUPTN9J7HDCbfcT, https://drive.google.com/open?id=1ZTPxN_991OozUffbyv13Wv65tnJz10aM, https://drive.google.com/open?id=1rM937GEzzbwF0fYufIQ6CYRzeahM3Xaj, https://drive.google.com/open?id=1Fo29XVtVlUGF37EkyXZ-kXjD8u7HOOUo, https://drive.google.com/open?id=1QcVitfRABL1NNfRCANAKgq17ut1-5qvR"
11/3/2026 12:22:07,Jhang,40. KARI WALA,tahli doulat khan,"https://drive.google.com/open?id=1cOnEoITHfjNBvveOuZZQVJ4ZMjybqwWj, https://drive.google.com/open?id=1NjctKmiEIr9xOZ1HKyf9QormXvAaIbmW, https://drive.google.com/open?id=1620UKDXP7cGpvbdUfpZLB8ZTI4Ivq5JN"
11/3/2026 12:34:51,Jhang,33. CHELA,Mouza kabli,https://drive.google.com/open?id=11b_xEVsnUy4GqOhMwF2Jfjo8pUJ3tSw8
11/3/2026 14:35:46,Jhang,38. RATA MATA SHUMALI,Panjgirae,https://drive.google.com/open?id=1_P-h2XIYHHxJB-IgHkVDArEPzO08T13P
11/3/2026 14:36:41,Jhang,31. MASSAN,Massan ,https://drive.google.com/open?id=1MK0AFk8xkFp_wiTlMT24euAOkL_ofvEb
11/3/2026 14:38:36,Jhang,23. CHAK NO. 463/JB,Hassan shah ,https://drive.google.com/open?id=12aCrdGTJFunErobrUgEm9sxaWqu3Disb
11/4/2026 10:05:05,Jhang,27. MANSOOR SIAL,Diraj ,"https://drive.google.com/open?id=1YRWmYhXXBtAqRxntkKe8pg3cwcXbuLKV, https://drive.google.com/open?id=19BL618RdvaSurpDm3_TP0WUJ-vwl_Exw"
11/4/2026 20:59:39,18-Hazari,83. UCH GUL IMAM,Mouza Uchgulimam ,https://drive.google.com/open?id=1Z6yDsF_H0wARtS9wn6mVRwhgx5iKa1IW
11/5/2026 10:25:01,Jhang,27. MANSOOR SIAL,Mansoor sial ,https://drive.google.com/open?id=1l4Zm8ByD5t3yrgfLHgzaSrRb8RFlAzV3
11/5/2026 11:13:33,18-Hazari,82. RODU SULTAN,Rodu sultan ,"https://drive.google.com/open?id=10f9YNSx4nfOvDIl80Q_VfSp9C_NANqGb, https://drive.google.com/open?id=1k1BpcLGfZLyYF4g23-ApevTuHEaxsMty, https://drive.google.com/open?id=1NnWWSgyR24Vgjy9VGwAACe1iQTxlzzc3, https://drive.google.com/open?id=1QDrvYjWHJOxQgZxqAgpGuOxXhulTon3N, https://drive.google.com/open?id=13Ag-IZkBL5XiU3KLL1NJVxid5ED3S1xl, https://drive.google.com/open?id=1VdzjJy717QGvr7YJAich618ClSgx8ndu, https://drive.google.com/open?id=1k6SlMVZhq33ir9H47rt08Spqjh1NccYW, https://drive.google.com/open?id=1Bu6akuaZt1C4azp-V3-wHhAE28jrP04p, https://drive.google.com/open?id=1DgsCSyZSeijlsnzGoKQN0QEZ8SK2ynvK, https://drive.google.com/open?id=1kH1aD4CIWcMVv8GQK4qxyJCCnOQHMjfT"
11/5/2026 11:49:32,18-Hazari,90. 7/2 THAL SHUMALI,Kot shakir,"https://drive.google.com/open?id=1jOvqpXZ-9O-iUN1SFmneOeb2ayxNLjj-, https://drive.google.com/open?id=1fJz111FN0UpUWaWfSARFSJccg79-jZZM, https://drive.google.com/open?id=1mqEliRITd2EfYqEmBpXgFbbPbSDEXw4y"
11/5/2026 12:23:18,18-Hazari,91. MARI SHAH SAKHERA,Mari,https://drive.google.com/open?id=1vwf2wdk8SzyW3T-pjvhqoW3jllod6MOC
11/5/2026 12:26:13,18-Hazari,91. MARI SHAH SAKHERA,Chohkin,https://drive.google.com/open?id=1mYHCVwLFczHAZ-UlaWeVC_1Ki5-R26oY
11/5/2026 12:32:11,18-Hazari,91. MARI SHAH SAKHERA,Bullo,https://drive.google.com/open?id=1W3Ngruc1MuSHIenLiFy1FvreqiFV46mt
11/6/2026 9:24:53,18-Hazari,81. KOT MURAD,Kot murad ,https://drive.google.com/open?id=1nHgDtjIRZaLfuDe8x1M4H2_G9iGnGRY0
11/6/2026 9:50:27,18-Hazari,81. KOT MURAD,Kot murad UC 81 ,https://drive.google.com/open?id=1fYqkZvKJWxTdkO46xuJoRgHDTXtT-NBy
11/6/2026 10:53:03,Jhang,27. MANSOOR SIAL,Mansoor sial,https://drive.google.com/open?id=1QJoVVIdwWnf-Q8XOf-MWAqw2D2oBQpp2
11/6/2026 12:08:27,18-Hazari,82. RODU SULTAN,Rodu sultan ,"https://drive.google.com/open?id=1t8vvQps_yHFNQ28IKpzADZ_o5HJQmHWS, https://drive.google.com/open?id=1pNnK5neSai8hlMh5VWzc1Yv2Jg_hLpN0, https://drive.google.com/open?id=1RwlgGZp7wJBHHW7oEIpvTEKR4pDPdx-m, https://drive.google.com/open?id=1FUXWj7Ur54vpG4NnkIwk4u57Y2R_eBPP, https://drive.google.com/open?id=1ZItxvrV598WmqtJNqzmQrfCz8dhZIpiT, https://drive.google.com/open?id=11kqsO3yFQQRVGgZWdh9sSjeZA48ibx2M, https://drive.google.com/open?id=16H2txAAI_jdCG85TqoXtpu5KTouRNLie, https://drive.google.com/open?id=1hsnuQSqv0zzM_7ZxwHifdSHb8LdkiuaV, https://drive.google.com/open?id=1SsjWHWzxT-ZyB2ivg-7SW2YJ2KxV4Z9R, https://drive.google.com/open?id=1JEeqdyBQ0coyZ2Z0RBSXLT72vw3Jovjx"
11/6/2026 13:35:25,Jhang,23. CHAK NO. 463/JB,Chak no 442,"https://drive.google.com/open?id=1lnzrat8euY1om5Ml7x7AYajzuX9eAFNq, https://drive.google.com/open?id=1osNttm2Z_MHFEb2VYsfR8eu9Qob9dGZP"
11/6/2026 13:44:18,Jhang,31. MASSAN,Massan ,https://drive.google.com/open?id=1YEm10NEWzMIkH6ulDrWFtv86bRUYOkwk
11/6/2026 13:45:28,Jhang,38. RATA MATA SHUMALI,Sher Garh ,https://drive.google.com/open?id=1oq6kDTe7EaA69RMQjZsteXHFlV8cQ4JV
11/6/2026 17:39:32,Jhang,01. CHAK NO. 159/JB,Chak No.161/JB,https://drive.google.com/open?id=1oZlU4bnO9KZe9IEj8vkQDPCiiZXUi7Sb`;

/**
 * Extracts Google Drive file ID from various Google Drive URL formats
 */
export function extractDriveFileId(url: string): string {
  const trimmed = url.trim();
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }
  return trimmed;
}

/**
 * Parses a single CSV line respecting double quotes
 */
function parseCsvRow(line: string): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cols.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cols.push(current);
  return cols;
}

/**
 * Formats Chak / Mouza names into clean Title Case while preserving numbers/codes
 */
function formatChakMouza(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return 'Unnamed Mouza';
  if (/^\d+$/.test(trimmed)) {
    return `Chak No. ${trimmed}`;
  }
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (/^(UC|JB|NO\.*)$/i.test(word)) {
        return word.toUpperCase();
      }
      if (/^\d/.test(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function formatDateLabel(datePart: string): string {
  const parts = datePart.split('/');
  if (parts.length !== 3) return datePart;
  const monthNum = parseInt(parts[0], 10);
  const dayNum = parseInt(parts[1], 10);
  const yearNum = parseInt(parts[2], 10);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const mName = months[monthNum - 1] || parts[0];
  return `${mName} ${String(dayNum).padStart(2, '0')}, ${yearNum}`;
}

/**
 * Parses the full CSV text into structured SurveyRecord items
 */
export function parseSurveyCsv(csvText: string): SurveyRecord[] {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  const records: SurveyRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (cols.length < 4) continue;

    const timestampRaw = (cols[0] || '').trim();
    const tehsilRaw = (cols[1] || '').trim();
    const ucRaw = (cols[2] || '').trim();
    const chakRaw = (cols[3] || '').trim();
    const picturesRaw = (cols.slice(4).join(',') || '').trim();

    const [datePart = '', timePart = ''] = timestampRaw.split(/\s+/);
    const dateFormatted = formatDateLabel(datePart);
    const parsedTime = Date.parse(timestampRaw);
    const sortTimestamp = Number.isNaN(parsedTime) ? i : parsedTime;

    // Extract UC number and name (e.g., "83. UCH GUL IMAM")
    const ucMatch = ucRaw.match(/^(\d+)\.\s*(.+)$/);
    const ucNumber = ucMatch ? ucMatch[1].padStart(2, '0') : '—';
    const ucName = ucMatch ? ucMatch[2].trim() : ucRaw;

    const chakMouzaClean = formatChakMouza(chakRaw);
    const recordId = `rec-${i}`;

    const rawLinks = picturesRaw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.startsWith('http'));

    const photos: GpsPhoto[] = rawLinks.map((url, idx) => {
      const fileId = extractDriveFileId(url);
      return {
        id: `${recordId}-photo-${idx + 1}`,
        fileId,
        originalUrl: `https://drive.google.com/open?id=${fileId}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
        highResUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`,
        lh3Url: `https://lh3.googleusercontent.com/d/${fileId}=w1000`,
        ucViewUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
        embedPreviewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        recordId,
        indexInRecord: idx + 1,
        tehsil: tehsilRaw,
        unionCouncil: ucRaw,
        chakMouza: chakMouzaClean,
        timestamp: timestampRaw,
        dateFormatted,
      };
    });

    records.push({
      id: recordId,
      rowNumber: i,
      timestamp: timestampRaw,
      datePart,
      timePart,
      dateFormatted,
      sortTimestamp,
      tehsil: tehsilRaw,
      unionCouncilRaw: ucRaw,
      ucNumber,
      ucName,
      chakMouzaRaw: chakRaw,
      chakMouzaClean,
      photos,
      photoCount: photos.length,
    });
  }

  return records;
}

export const INITIAL_SURVEY_RECORDS: SurveyRecord[] = parseSurveyCsv(RAW_SURVEY_CSV);

export const DEFAULT_GOOGLE_SHEET_URL =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('sheet') ||
      localStorage.getItem('jhang_survey_google_sheet_url') ||
      PERMANENT_GOOGLE_SHEET_URL
    : PERMANENT_GOOGLE_SHEET_URL;

/**
 * Converts any Google Sheets URL (edit link, share link, pubhtml link, or Sheet ID)
 * into a direct CORS-compatible CSV export URL.
 */
export function resolveGoogleSheetCsvUrl(input: string): {
  primaryUrl: string;
  fallbackUrl: string;
  displayLabel: string;
  sheetId?: string;
  gid?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    const bust = `t=${Date.now()}`;
    const sep = ATTACHED_CSV_ASSET_PATH.includes('?') ? '&' : '?';
    const localUrl = `${ATTACHED_CSV_ASSET_PATH}${sep}${bust}`;
    return {
      primaryUrl: localUrl,
      fallbackUrl: localUrl,
      displayLabel: 'Areas 31.10.2026 (Responses)',
    };
  }

  // Case 1: "Published to the web" link (/spreadsheets/d/e/2PACX-...)
  const pubMatch = trimmed.match(
    /\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/
  );
  if (pubMatch && pubMatch[1]) {
    const pubId = pubMatch[1];
    const gidMatch = trimmed.match(/[?&]gid=(\d+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    const pubCsvUrl = `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv${gidParam}&t=${Date.now()}`;
    return {
      primaryUrl: pubCsvUrl,
      fallbackUrl: pubCsvUrl,
      displayLabel: `Google Sheet (Published ${pubId.slice(0, 10)}…)`,
    };
  }

  // Case 2: Standard Google Sheet link (/spreadsheets/d/{SHEET_ID}/...)
  const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetMatch && sheetMatch[1]) {
    const sheetId = sheetMatch[1];
    const gidMatch = trimmed.match(/[#?&]gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : undefined;
    const gidParam = gid ? `&gid=${gid}` : '';
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}&t=${Date.now()}`;
    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}&t=${Date.now()}`;
    return {
      primaryUrl: gvizUrl,
      fallbackUrl: exportUrl,
      displayLabel: `Live Google Sheet (${sheetId.slice(0, 10)}…)`,
      sheetId,
      gid,
    };
  }

  // Case 3: Raw Google Sheet ID (alphanumeric/hyphen/underscore, 25+ chars)
  if (/^[a-zA-Z0-9-_]{25,}$/.test(trimmed)) {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${trimmed}/gviz/tq?tqx=out:csv&t=${Date.now()}`;
    const exportUrl = `https://docs.google.com/spreadsheets/d/${trimmed}/export?format=csv&t=${Date.now()}`;
    return {
      primaryUrl: gvizUrl,
      fallbackUrl: exportUrl,
      displayLabel: `Live Google Sheet (${trimmed.slice(0, 10)}…)`,
      sheetId: trimmed,
    };
  }

  // Case 4: Custom CSV endpoint URL
  const sep = trimmed.includes('?') ? '&' : '?';
  const customUrl = `${trimmed}${sep}t=${Date.now()}`;
  return {
    primaryUrl: customUrl,
    fallbackUrl: customUrl,
    displayLabel: 'Live CSV Endpoint',
  };
}

interface GvizCell {
  v?: string | number | null;
  f?: string | null;
}

interface GvizResponse {
  status?: string;
  table?: {
    cols?: Array<{ label?: string }>;
    rows?: Array<{ c?: Array<GvizCell | null> }>;
  };
}

function escapeCsvCell(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/**
 * Fetches live Google Sheet rows using JSONP (<script> tag) so browser CORS
 * or logged-in Google cookie redirects never block 10-second polling on GitHub Pages.
 */
function fetchSheetViaJsonp(
  sheetId: string,
  gid?: string
): Promise<SurveyRecord[]> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('No DOM available'));
      return;
    }

    const cbName = `__gvizCallback_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const script = document.createElement('script');
    const win = window as unknown as Record<string, unknown>;

    const cleanup = () => {
      delete win[cbName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('JSONP request timed out'));
    }, 8000);

    win[cbName] = (data: GvizResponse) => {
      window.clearTimeout(timeoutId);
      cleanup();
      try {
        if (!data || data.status !== 'ok' || !data.table?.rows) {
          reject(new Error('Invalid gviz response'));
          return;
        }
        const headerLine =
          'Timestamp,Tehsil,Union Council,Name of Chak/Mouza,Attach GPS Pictures';
        const csvLines = [headerLine];

        for (const row of data.table.rows) {
          const cells = row.c || [];
          const colValues = [0, 1, 2, 3, 4].map((idx) => {
            const cell = cells[idx];
            if (!cell) return '';
            const raw =
              cell.f !== undefined && cell.f !== null
                ? String(cell.f)
                : cell.v !== undefined && cell.v !== null
                ? String(cell.v)
                : '';
            return escapeCsvCell(raw);
          });
          if (colValues.some((v) => v.trim().length > 0)) {
            csvLines.push(colValues.join(','));
          }
        }

        const parsed = parseSurveyCsv(csvLines.join('\n'));
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };

    script.onerror = () => {
      window.clearTimeout(timeoutId);
      cleanup();
      reject(new Error('JSONP script load error'));
    };

    const gidParam = gid ? `&gid=${gid}` : '';
    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${cbName}${gidParam}&_=${Date.now()}`;
    script.async = true;
    document.head.appendChild(script);
  });
}

export async function fetchAttachedSurveyCsv(
  customSheetUrl?: string
): Promise<{
  records: SurveyRecord[];
  sourceLabel: string;
  error?: string;
}> {
  const activeUrl =
    customSheetUrl !== undefined ? customSheetUrl : DEFAULT_GOOGLE_SHEET_URL;
  const { primaryUrl, fallbackUrl, displayLabel, sheetId, gid } =
    resolveGoogleSheetCsvUrl(activeUrl);

  // 1. Try CORS-proof JSONP first whenever a Google Sheet ID is available
  if (sheetId) {
    try {
      const jsonpRecords = await fetchSheetViaJsonp(sheetId, gid);
      if (jsonpRecords.length > 0) {
        return {
          records: jsonpRecords,
          sourceLabel: displayLabel,
        };
      }
    } catch {
      // Fall through to credential-less fetch
    }
  }

  // 2. Fallback to credential-less fetch
  try {
    let response = await fetch(primaryUrl, {
      cache: 'no-store',
      credentials: 'omit',
    });
    if (!response.ok && fallbackUrl !== primaryUrl) {
      response = await fetch(fallbackUrl, {
        cache: 'no-store',
        credentials: 'omit',
      });
    }
    if (!response.ok) {
      return {
        records: INITIAL_SURVEY_RECORDS,
        sourceLabel: displayLabel,
        error: `HTTP ${response.status} when syncing sheet. Ensure the Google Sheet is shared as "Anyone with the link can view".`,
      };
    }
    const text = await response.text();
    const parsed = parseSurveyCsv(text);
    if (parsed.length === 0) {
      return {
        records: INITIAL_SURVEY_RECORDS,
        sourceLabel: displayLabel,
        error:
          'Sheet response did not contain valid CSV rows. Ensure the sheet is public ("Anyone with the link can view").',
      };
    }
    return {
      records: parsed,
      sourceLabel: displayLabel,
    };
  } catch {
    return {
      records: INITIAL_SURVEY_RECORDS,
      sourceLabel: displayLabel,
      error: activeUrl
        ? 'Could not reach Google Sheet. Verify that link sharing is set to "Anyone with the link can view".'
        : undefined,
    };
  }
}
