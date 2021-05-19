import { Box, Button, Grid, Link, makeStyles, Paper, Typography } from '@material-ui/core'
import CloudDoneIcon from '@material-ui/icons/CloudDone'
import ErrorIcon from '@material-ui/icons/Error'
import React, { useEffect, useState } from 'react'
import BulSectionCreateUploadConfirmationTable, { Section } from '../components/BulSectionCreateUploadConfirmationTable'
import FileUpload from '../components/FileUpload'
import ValidationErrorTable from '../components/ValidationErrorTable'
import { createSectionsProps } from '../models/feature'

const FILE_HEADER = 'SECTION_NAME'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 25,
    textAlign: 'left',
    '& button': {
      margin: 5
    }
  },
  fileNameContainer: {
    marginBottom: 15,
    paddingLeft: 10,
    paddingRight: 10
  },
  fileName: {
    color: '#3F648E',
    fontFamily: 'monospace'
  },
  uploadHeader: {
    paddingTop: 15
  }
}))

const useConfirmationStyles = makeStyles((theme) => ({
  dialog: {
    textAlign: 'center',
    marginBottom: 15,
    paddingLeft: 10,
    paddingRight: 10
  },
  table: {
    paddingLeft: 10,
    paddingRight: 10
  },
  dialogIcon: {
    color: '#3F648E'
  }
}))

const useRowLevelErrorStyles = makeStyles((theme) => ({
  dialog: {
    textAlign: 'center',
    marginBottom: 15,
    paddingLeft: 10,
    paddingRight: 10
  },
  table: {
    paddingLeft: 10,
    paddingRight: 10
  },
  dialogIcon: {
    color: 'red'
  }
}))

const useTopLevelErrorStyles = makeStyles((theme) => ({
  dialog: {
    textAlign: 'center',
    maxWidth: '75%',
    margin: 'auto',
    marginBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
    width: '75%',
    '& ol': {
      margin: 'auto',
      width: '75%'
    },
    '& li': {
      textAlign: 'left'
    }
  },
  dialogIcon: {
    color: 'red'
  }
}))

enum BulkSectionCreatePageState {
  Upload,
  InvalidUpload,
  Confirm,
  Done
}

interface BulkSectionCreatePageStateData {
  state: BulkSectionCreatePageState
  rowInvalidations: SectionsRowInvalidation[]
  schemaInvalidation: SectionsSchemaInvalidation[]
}

const isHeader = (text: string): boolean => {
  return text.toUpperCase() === FILE_HEADER.toUpperCase()
}

const hasHeader = (sectionNames: string[]): boolean => {
  return sectionNames.length > 0 && isHeader(sectionNames[0])
}

// Original requirement was to have a warning for missing header row, leaving this for now
enum InvalidationType {
  Error,
  Warning
}

interface SectionsSchemaInvalidation {
  error: string
  type: InvalidationType
}

// For validating schema level problems
interface SectionsSchemaValidator {
  validate: (sectionName: string[]) => SectionsSchemaInvalidation[]
}

class SectionNameHeaderValidator implements SectionsSchemaValidator {
  validate = (sectionNames: string[]): SectionsSchemaInvalidation[] => {
    const invalidations: SectionsSchemaInvalidation[] = []

    if (!hasHeader(sectionNames)) {
      invalidations.push({ error: 'Missing SECTION_NAME Header Row', type: InvalidationType.Error })
    }
    if (sectionNames.length === 0) {
      invalidations.push({ error: 'No data', type: InvalidationType.Error })
    }

    if (sectionNames.length === 1 && isHeader(sectionNames[0])) {
      invalidations.push({ error: 'No data', type: InvalidationType.Error })
    }
    return invalidations
  }
}

// For validating row level issues
interface SectionsRowInvalidation {
  message: string
  rowNumber: number
  type: InvalidationType
}

interface SectionRowsValidator {
  validate: (sectionName: string[]) => SectionsRowInvalidation[]
}

class DuplicateSectionInFileSectionRowsValidator implements SectionRowsValidator {
  validate = (sectionNames: string[]): SectionsRowInvalidation[] => {
    const sortedSectionNames = sectionNames.map(n => { return n.toUpperCase() }).sort((a, b) => { return a.localeCompare(b) })
    const duplicates: string[] = []
    for (let i = 1; i < sortedSectionNames.length; ++i) {
      if (sortedSectionNames[i - 1] === sortedSectionNames[i] && !duplicates.includes(sortedSectionNames[i])) {
        duplicates.push(sortedSectionNames[i])
      }
    }
    if (duplicates.length === 0) {
      return []
    }
    const invalidations: SectionsRowInvalidation[] = []
    console.log(duplicates)
    let i = 0
    sectionNames.forEach(sectionName => {
      if (duplicates.includes(sectionName.toUpperCase())) {
        invalidations.push({ message: 'Duplicate section name: "' + sectionName + '"', rowNumber: ++i, type: InvalidationType.Error })
      }
    })
    return invalidations
  }
}
function BulkSectionCreate (): JSX.Element {
  const classes = useStyles()
  const confirmationClasses = useConfirmationStyles()
  const rowLevelErrorClasses = useRowLevelErrorStyles()
  const topLevelClasses = useTopLevelErrorStyles()

  const [pageState, setPageState] = useState<BulkSectionCreatePageStateData>({ state: BulkSectionCreatePageState.Upload, schemaInvalidation: [], rowInvalidations: [] })
  const [file, setFile] = useState<File|undefined>(undefined)
  const [sectionNames, setSectionNames] = useState<string[]>([])

  const uploadComplete = (file: File): void => {
    setFile(file)
  }

  useEffect(() => {
    parseUpload(file)
  }, [file])

  const resetPageState = (): void => {
    setPageState({ state: BulkSectionCreatePageState.Upload, schemaInvalidation: [], rowInvalidations: [] })
  }

  const handleSchemaError = (errorMessage: JSX.Element, schemaInvalidations: SectionsSchemaInvalidation[]): void => {
    console.log('Schema Error')
    schemaInvalidations.forEach(i => {
      console.log(i)
    })
    setPageState({ state: BulkSectionCreatePageState.InvalidUpload, schemaInvalidation: schemaInvalidations, rowInvalidations: [] })
  }

  const handleRowLevelInvalidationError = (errorMessage: JSX.Element[], invalidations: SectionsRowInvalidation[]): void => {
    setPageState({ state: BulkSectionCreatePageState.InvalidUpload, schemaInvalidation: [], rowInvalidations: invalidations })
  }

  const handleParseSuccess = (sectionNames: string[]): void => {
    setSectionNames(sectionNames)
    setPageState({ state: BulkSectionCreatePageState.Confirm, schemaInvalidation: [], rowInvalidations: [] })
  }

  const parseUpload = (file: File|undefined): void => {
    if (file === undefined) {
      resetPageState()
      return
    }
    file.text().then(t => {
      let lines = t.split(/[\r\n]+/).map(line => { return line.trim() })
      // An empty file will resultin 1 line
      if (lines.length > 0 && lines[0].length === 0) {
        lines = lines.slice(1)
      }
      lines.forEach(l => {
        console.log(l)
      })

      const schemaInvalidations: SectionsSchemaInvalidation[] = []

      const sectionNameHeaderValidator: SectionsSchemaValidator = new SectionNameHeaderValidator()
      schemaInvalidations.push(...sectionNameHeaderValidator.validate(lines))

      if (schemaInvalidations.length !== 0) {
        handleSchemaError(<div>Schema error!</div>, schemaInvalidations)
        return
      }

      if (hasHeader(lines)) {
        lines = lines.slice(1)
      }

      const rowInvalidations: SectionsRowInvalidation[] = []

      const duplicateNamesInFileValidator: SectionRowsValidator = new DuplicateSectionInFileSectionRowsValidator()
      rowInvalidations.push(...duplicateNamesInFileValidator.validate(lines))

      if (rowInvalidations.length !== 0) {
        handleRowLevelInvalidationError([<div key='0'>Row Error!</div>], rowInvalidations)
        return
      }

      handleParseSuccess(lines)
    }).catch(e => {
      console.log(e)
    })
  }

  const renderUploadHeader = (): JSX.Element => {
    return <div className={classes.uploadHeader}>
      <Typography variant='h6'>Upload your CSV File</Typography>
      <br/>
      <Typography><strong>Requirement:</strong> Your file should include one section name per line</Typography>
      <Typography>View a <Link href='#'>CSV File Example</Link></Typography>
    </div>
  }

  const renderFileUpload = (): JSX.Element => {
    return <span>
      <Grid container>
        <Grid item xs={12}>
          <FileUpload onUploadComplete={uploadComplete}></FileUpload>
        </Grid>
      </Grid>
    </span>
  }

  const renderUpload = (): JSX.Element => {
    return <span>
      {renderUploadHeader()}
      <br/>
      {renderFileUpload()}
    </span>
  }

  const renderCSVFileName = (): JSX.Element => {
    if (file !== undefined) {
      return (<h5 className={classes.fileNameContainer}><Typography component='span'>File: </Typography><Typography component='span' className={classes.fileName}>{file.name}</Typography></h5>)
    } else {
      return <></>
    }
  }

  const renderUploadAgainButton = (): JSX.Element => {
    return <Button color='primary' component="span" onClick={() => resetPageState()}>Upload again</Button>
  }

  const renderRowLevelErrors = (invalidations: SectionsRowInvalidation[]): JSX.Element => {
    return (
      <div>
        {renderCSVFileName()}
        <Grid container justify='flex-start'>
          <Box clone order={{ xs: 2, sm: 1 }}>
            <Grid item xs={12} sm={9} className={rowLevelErrorClasses.table} >
              <ValidationErrorTable invalidations={invalidations} />
            </Grid>
          </Box>
          <Box clone order={{ xs: 1, sm: 2 }}>
            <Grid item xs={12} sm={3} className={rowLevelErrorClasses.dialog}>
              <Paper role='alert' >
                <Typography>Review your CSV file</Typography>
                <ErrorIcon className={rowLevelErrorClasses.dialogIcon} fontSize='large'/>
                <Typography>Correct the file and{renderUploadAgainButton()}</Typography>
              </Paper>
            </Grid>
          </Box>
        </Grid>
      </div>)
  }

  const renderTopLevelErrors = (errors: JSX.Element[]): JSX.Element => {
    return (
      <div>
        {renderCSVFileName()}
        <Grid container justify='flex-start'>
          <Grid item xs={12} className={topLevelClasses.dialog}>
            <Paper role='alert'>
              <Typography>Review your CSV file</Typography>
              <ErrorIcon className={topLevelClasses.dialogIcon} fontSize='large'/>
              <Typography>Correct the file and{renderUploadAgainButton()}</Typography>
              <ol>
                {errors.map(e => {
                  return (<li key={e.key}>{e}</li>)
                })}
              </ol>
            </Paper>
          </Grid>
        </Grid>
      </div>)
  }

  const renderInvalidUpload = (): JSX.Element => {
    let rowLevelErrors: JSX.Element | undefined
    let schemaLevelErrors: JSX.Element | undefined
    if (pageState.rowInvalidations.length > 0) {
      rowLevelErrors = renderRowLevelErrors(pageState.rowInvalidations)
    }
    if (pageState.schemaInvalidation.length > 0) {
      const schemaErrors: JSX.Element[] = []
      for (let i = 0; i < pageState.schemaInvalidation.length; ++i) {
        schemaErrors.push(<div key={i}>{pageState.schemaInvalidation[i].error}</div>)
      }
      schemaLevelErrors = <div>{renderTopLevelErrors(schemaErrors)}</div>
    }
    return (
      <div>
        {schemaLevelErrors !== undefined && schemaLevelErrors}
        {rowLevelErrors !== undefined && rowLevelErrors}
      </div>
    )
  }

  const renderConfirm = (sectionNames: Section[]): JSX.Element => {
    return (
      <div>
        {renderCSVFileName()}
        <Grid container>
          <Box clone order={{ xs: 2, sm: 1 }}>
            <Grid item xs={12} sm={9} className={confirmationClasses.table}>
              <BulSectionCreateUploadConfirmationTable sectionNames={sectionNames}/>
            </Grid>
          </Box>
          <Box clone order={{ xs: 1, sm: 2 }}>
            <Grid item xs={12} sm={3} className={confirmationClasses.dialog}>
              <Paper role='status'>
                <Typography>Review your CSV file</Typography>
                <CloudDoneIcon className={confirmationClasses.dialogIcon} fontSize='large'/>
                <Typography>Your file is valid!  If this looks correct proceed with download</Typography>
                <Button variant="outlined" onClick={(e) => resetPageState()}>Do Something</Button>
                {/* <Link href={downloadData?.data} download={downloadData?.fileName}>
                  <Button disabled={downloadData === undefined} variant='outlined' color='primary'>Download</Button>
                </Link> */}
              </Paper>
            </Grid>
          </Box>
        </Grid>
      </div>)
  }

  const sectionNamesToSection = (sectionNames: string[]): Section[] => {
    const sections: Section[] = []
    for (let i = 0; i < sectionNames.length; ++i) {
      sections.push({ rowNumber: i + 1, sectionName: sectionNames[i] })
    }
    return sections
  }

  const renderComponent = (): JSX.Element => {
    switch (pageState.state) {
      case BulkSectionCreatePageState.Upload:
        return renderUpload()
      case BulkSectionCreatePageState.InvalidUpload:
        return renderInvalidUpload()
      case BulkSectionCreatePageState.Confirm:
        return renderConfirm(sectionNamesToSection(sectionNames))
      case BulkSectionCreatePageState.Done:
        return (<div>DONE</div>)
      default:
        return <div>?</div>
    }
  }

  return (
    <div className={classes.root}>
      <Typography variant='h5'>{createSectionsProps.title}</Typography>
      {renderComponent()}
    </div>
  )
}

export default BulkSectionCreate