// Commits all working file to git (cmd alt ctrl c)
import { sendEvent } from '../analytics'
import { getCurrentBranch, checkForFile, executeSafely, exec, createInputWithCheckbox, exportArtboards } from '../common'
import { getUserPreferences } from '../preferences'
import push from 'push'

export default function (context) {
  if (!checkForFile(context)) { return }
  executeSafely(context, function () {
    sendEvent(context, 'Commit', 'Start commiting')
    var currentBranch = getCurrentBranch(context)
    var commitMsg = createInputWithCheckbox(context, 'Commit to "' + currentBranch + '"', 'Commit')

    if (commitMsg.responseCode == 1000 && commitMsg.message != null) {

      // Generate pretty diffs if requested
      if (commitMsg.generateDiffs) {
        sendEvent(context, 'Commit', 'Export artboards')
        exportArtboards(context)
      }
      
      sendEvent(context, 'Commit', 'Do commit')
      var command = `git commit -m "${commitMsg.message.split('"').join('\\"')}" -a; exit`
      var message = exec(context, command)
      context.document.showMessage(message.split('\n').join(' '))

      // Push automatically if requested
      if (commitMsg.push) {
        try {
          push()
        } catch (e) {
          sendError(context, e)
          createFailAlert(context, 'Failed to push automatically. Please address the error and push manually.', e, true)
        }
      }
    }
  })
}
