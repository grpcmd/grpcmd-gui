import { useWindowStore } from '@/window-store'
import Joyride, { type Callback } from 'react-joyride'

export default function Tour() {
  const hasSeenTour = useWindowStore.use.hasSeenTour()
  const setHasSeenTour = useWindowStore.use.setHasSeenTour()

  const steps = [
    {
      target: '#sidebar-content',
      content:
        'Welcome to this quick tour of the user interface! This sidebar section contains your workspace requests. Requests are automatically deleted after 7 days. (This can be configured or disabled in the settings.)',
      placement: 'right',
      style: {
        tooltipContainer: {
          textAlign: 'left',
        },
      },
    },
    {
      target: '#input-address',
      content:
        'Within a request, you can enter the address of the gRPC service you want to call.',
    },
    {
      target: '#input-method',
      content:
        'Next, you can enter the method you want to call. The methods can be sourced from either a proto file or the gRPC reflection service (if implemented in the target server). You can configure the import paths in the Settings.',
    },
    {
      target: '#generate-request-template',
      content:
        'After selecting the method, you can generate a request template to populate the JSON fields.',
    },
    {
      target: '.input-request',
      content:
        'Next, fill out the request contents. Note: you can specify a list of headers before the first JSON object. Also, for methods that have a streaming request, you can specify multiple JSON objects to send.',
      placement: 'right',
    },
    {
      target: '#send-request',
      content: 'Finally, send the request!',
    },
    {
      target: '.output-response',
      content:
        'Once the response is received, you can view all parts of the response here including: the headers, the body, and the trailers.',
      placement: 'left',
    },
    {
      target: '#suggest-feature',
      content:
        'If you have any suggestions or feature requests, submit them here!',
    },
    {
      target: '#report-bug',
      content: 'If you encounter any problems, report an issue on GitHub.',
    },
    {
      target: '#input-theme',
      content: 'Personalize the UI by changing the theme and get started!',
    },
  ]

  const handleCallback: Callback = (data) => {
    if (
      data.status === 'finished' ||
      data.status === 'skipped' ||
      data.status === 'error'
    ) {
      setHasSeenTour(true)
    }
  }

  return (
    <div>
      <Joyride
        /* @ts-ignore */
        steps={steps}
        run={!hasSeenTour}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        callback={handleCallback}
        locale={{
          last: 'Finish',
        }}
        styles={{
          options: {
            arrowColor: 'hsl(var(--background))',
            backgroundColor: 'hsl(var(--background))',
            overlayColor: 'hsl(var(--primary) / 0.20)',
            primaryColor: 'hsl(var(--primary))',
            textColor: 'hsl(var(--foreground))',
          },
          buttonNext: {
            color: 'hsl(var(--primary-foreground))',
          },
        }}
      />
    </div>
  )
}
