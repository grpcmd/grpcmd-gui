import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useWindowStore } from '@/window-store'
import { Browser } from '@wailsio/runtime'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import GitHubButton from 'react-github-btn'

export default function Onboarding() {
  const hasSeenOnboarding = useWindowStore.use.hasSeenOnboarding()
  const setHasSeenOnboarding = useWindowStore.use.setHasSeenOnboarding()
  const setHasSeenTour = useWindowStore.use.setHasSeenTour()
  const [step, setStep] = useState(1)

  const stepContent = [
    {
      title: 'Welcome to grpcmd-gui!',
      description:
        'Thanks for downloading! You are an early user of this gRPC API desktop client! Please keep in mind that this software is still in development and may contain bugs. However, it is fully functional!',
    },
    {
      title: 'Current Features',
      description:
        'There are many functional features such as: sending requests sourcing the proto definitions from either Reflection or .proto files., viewing the full response including headers and trailers, and automatic timed deletion of request tabs.',
    },
    {
      title: 'Future Features',
      description:
        'There are many more amazing features planned such as: workspaces (for each project), offline team collaboration synced with Git, and more custom themes!',
    },
    {
      title: 'Star on GitHub',
      description:
        'If you enjoy using this software, please consider giving it a star on GitHub!',
    },
  ]

  const totalSteps = stepContent.length

  const handlePrevious = () => {
    if (1 < step) {
      setStep(step - 1)
    }
  }
  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const openGitHubGrpcmd = () =>
    Browser.OpenURL('https://github.com/grpcmd/grpcmd')
  const openGitHubGrpcmdGui = () =>
    Browser.OpenURL('https://github.com/grpcmd/grpcmd-gui')

  return (
    <Dialog
      open={!hasSeenOnboarding}
      onOpenChange={(open) => {
        if (open) setStep(1)
      }}
    >
      <DialogContent className="gap-0 p-0 [&>button:last-child]:text-white">
        <div className="p-2">
          {/* <img
            className="w-full rounded-lg"
            src="/dialog-content.png"
            width={382}
            height={216}
            alt="dialog"
          /> */}
        </div>
        <div className="space-y-6 px-6 pb-6 pt-3">
          <DialogHeader>
            <DialogTitle>{stepContent[step - 1].title}</DialogTitle>
            <DialogDescription>
              {stepContent[step - 1].description}
            </DialogDescription>
          </DialogHeader>
          {step === 4 && (
            <>
              <div className="flex w-full justify-center">
                <p
                  className="w-[170px] font-semibold text-center"
                  wml-openurl="https://google.com"
                >
                  grpcmd
                </p>
                <p className="w-[170px] font-semibold text-center">
                  grpcmd-gui
                </p>
              </div>
              <div
                className="flex w-full justify-center"
                onClick={openGitHubGrpcmd}
                onKeyUp={openGitHubGrpcmd}
              >
                <div className="w-[170px] text-center">
                  <GitHubButton
                    href="https://github.com/grpcmd/grpcmd"
                    data-color-scheme="no-preference: light; light: light; dark: dark;"
                    data-icon="octicon-star"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Star grpcmd/grpcmd on GitHub"
                  >
                    Star
                  </GitHubButton>
                </div>
                <div
                  className="w-[170px] text-center"
                  onClick={openGitHubGrpcmdGui}
                  onKeyUp={openGitHubGrpcmdGui}
                >
                  <GitHubButton
                    href="https://github.com/grpcmd/grpcmd-gui"
                    data-color-scheme="no-preference: light; light: light; dark: dark;"
                    data-icon="octicon-star"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Star grpcmd/grpcmd-gui on GitHub"
                  >
                    Star
                  </GitHubButton>
                </div>
              </div>
              <p className="w-full text-center">Let's get to 128 stars!</p>
            </>
          )}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex justify-center space-x-1.5 max-sm:order-1">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: order of items don't change
                  key={index}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full bg-primary',
                    index + 1 === step ? 'bg-primary' : 'opacity-20',
                  )}
                />
              ))}
            </div>
            <DialogFooter>
              {1 < step && (
                <Button
                  className="group"
                  type="button"
                  variant={'secondary'}
                  onClick={handlePrevious}
                >
                  <ArrowLeft
                    className="-ms-1 me-2 opacity-60 transition-transform group-hover:-translate-x-0.5"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Previous
                </Button>
              )}
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setHasSeenOnboarding(true)}
                >
                  Skip
                </Button>
              </DialogClose>
              {step < totalSteps ? (
                <Button
                  className="group"
                  type="button"
                  onClick={handleContinue}
                >
                  Next
                  <ArrowRight
                    className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button
                    type="button"
                    onClick={() => {
                      setHasSeenOnboarding(true)
                      setHasSeenTour(false)
                    }}
                  >
                    Begin Tour
                  </Button>
                </DialogClose>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
