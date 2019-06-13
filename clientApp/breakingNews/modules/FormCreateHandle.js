//Type your code here
function FormSubNewsCreatePostShow() {
    FormSubNewsCreate.lstBoxState.masterData = stateNewsListBoxMasterData;
    selectedObjectName = FormSubNewsCreate.lstBoxNewsType.selectedKey;
  	selectedStateKey = FormSubNewsCreate.lstBoxState.selectedKey;
  	selectedStateKey = Number(selectedStateKey);
    formatDateForSync(FormSubNewsCreate.calBtn.date);
}