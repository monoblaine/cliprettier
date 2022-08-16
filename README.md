# cliprettier

Prettify code in any editor.

1. Install this package globally (`npm install -g https://github.com/monoblaine/cliprettier`)
2. Use the AutoHotkey script below to register a hotkey for the package. (Default hotkey is <kbd>AltGr</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd>)
3. Select some text and use the hotkey combination.
4. You'll be prompted to enter file extension for the highlighted code. (The script will try guessing the extension by using the title of active window.)
5. The prettified code will automatically be pasted to the active editor.


```ahk
#NoTrayIcon
#NoEnv
#KeyHistory 0
ListLines Off
SetBatchLines, -1
SetKeyDelay, -1, -1
SetMouseDelay, -1
SetDefaultMouseSpeed, 0
SetWinDelay, -1
SetControlDelay, -1
SendMode Input
#SingleInstance force

^!+f:: ; ctrl alt shift f (altgr shift f)
    clipboard := ""
    Send, ^c
    ClipWait, 0.25
    clipboard := clipboard

    if !StrLen(clipboard) {
        return
    }

    WinGetTitle, activeWinTitle, A
    RegExMatch(activeWinTitle, "\.(\w+)(?:[^.]+)$", match)
    InputBox, fileExtension, File extension, ,, 173, 108,,,,, %match1%

    if ErrorLevel {
        return
    }

    clipboard := cmdRet("cmd /c cliprettier " . fileExtension)
    Send, ^v
return

; Credits: https://www.autohotkey.com/boards/viewtopic.php?p=369467&sid=8f629fbb868110d24a4db2545cd0fa08#p369467
cmdRet(sCmd, callBackFuncObj := "", encoding := "CP0") {
   static HANDLE_FLAG_INHERIT := 0x00000001, flags := HANDLE_FLAG_INHERIT
        , STARTF_USESTDHANDLES := 0x100, CREATE_NO_WINDOW := 0x08000000

   DllCall("CreatePipe", "PtrP", hPipeRead, "PtrP", hPipeWrite, "Ptr", 0, "UInt", 0)
   DllCall("SetHandleInformation", "Ptr", hPipeWrite, "UInt", flags, "UInt", HANDLE_FLAG_INHERIT)

   VarSetCapacity(STARTUPINFO , siSize :=    A_PtrSize*4 + 4*8 + A_PtrSize*5, 0)
   NumPut(siSize              , STARTUPINFO)
   NumPut(STARTF_USESTDHANDLES, STARTUPINFO, A_PtrSize*4 + 4*7)
   NumPut(hPipeWrite          , STARTUPINFO, A_PtrSize*4 + 4*8 + A_PtrSize*3)
   NumPut(hPipeWrite          , STARTUPINFO, A_PtrSize*4 + 4*8 + A_PtrSize*4)

   VarSetCapacity(PROCESS_INFORMATION, A_PtrSize*2 + 4*2, 0)

   if !DllCall("CreateProcess", "Ptr", 0, "Str", sCmd, "Ptr", 0, "Ptr", 0, "UInt", true, "UInt", CREATE_NO_WINDOW
                              , "Ptr", 0, "Ptr", 0, "Ptr", &STARTUPINFO, "Ptr", &PROCESS_INFORMATION) {
      DllCall("CloseHandle", "Ptr", hPipeRead)
      DllCall("CloseHandle", "Ptr", hPipeWrite)
      throw Exception("CreateProcess is failed")
   }

   DllCall("CloseHandle", "Ptr", hPipeWrite)
   VarSetCapacity(sTemp, 4096), nSize := 0

   while DllCall("ReadFile", "Ptr", hPipeRead, "Ptr", &sTemp, "UInt", 4096, "UIntP", nSize, "UInt", 0) {
      sOutput .= stdOut := StrGet(&sTemp, nSize, encoding)
      ( callBackFuncObj && callBackFuncObj.Call(stdOut) )
   }

   DllCall("CloseHandle", "Ptr", NumGet(PROCESS_INFORMATION))
   DllCall("CloseHandle", "Ptr", NumGet(PROCESS_INFORMATION, A_PtrSize))
   DllCall("CloseHandle", "Ptr", hPipeRead)

   return sOutput
}
```
