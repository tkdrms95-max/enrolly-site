/**
 * Enrolly 사전신청 폼 처리 스크립트
 * - 이 스크립트가 바인딩된 구글 시트에 신청 내역을 한 행씩 추가
 * - 신청이 들어올 때마다 지정된 이메일로 알림 발송
 *
 * 설치 방법:
 * 1. 새 구글 시트를 만든다 (이름 예: "엔롤리 사전신청")
 * 2. 상단 메뉴 확장 프로그램(Extensions) > Apps Script 클릭
 * 3. 기본 코드(Code.gs)를 전부 지우고 이 파일 내용을 붙여넣기
 * 4. NOTIFY_EMAIL 값을 실제 알림받을 이메일로 수정
 * 5. 저장 (Ctrl+S)
 * 6. 오른쪽 위 "배포(Deploy)" > "새 배포(New deployment)" 클릭
 * 7. 유형 선택에서 톱니바퀴 클릭 > "웹 앱(Web app)" 선택
 * 8. 설정:
 *    - 실행할 계정: 나(Me)
 *    - 액세스 권한이 있는 사용자: 모든 사용자(Anyone)  ← 반드시 이걸로 설정해야 홈페이지에서 접근 가능
 * 9. "배포" 클릭 → 권한 승인 절차 진행 (본인 계정이니 "고급" > "이동" 눌러서 진행)
 * 10. 배포 완료 후 나오는 "웹 앱 URL"을 복사해서 Hermes에게 전달
 */

const NOTIFY_EMAIL = "enrolly@enrolly.kr"; // 알림 받을 이메일 주소로 수정하세요

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 첫 행이 비어있으면 헤더 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["접수일시", "학원 이름", "업종", "원장님 연락처", "유입 채널"]);
    }

    const data = JSON.parse(e.postData.contents);
    const name = data.name || "";
    const industry = data.industry || "";
    const phone = data.phone || "";
    const ref = data.ref || "direct";
    const now = new Date();

    sheet.appendRow([now, name, industry, phone, ref]);

    // 이메일 알림 발송
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "[엔롤리] 새 사전신청: " + name,
      body:
        "새로운 사전신청이 접수되었습니다.\n\n" +
        "학원 이름: " + name + "\n" +
        "업종: " + industry + "\n" +
        "연락처: " + phone + "\n" +
        "유입 채널: " + ref + "\n" +
        "접수 시각: " + now.toLocaleString("ko-KR"),
    });

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
