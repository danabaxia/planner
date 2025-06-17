import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', {
      name: /daily activity planner/i,
      level: 1,
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<Home />)

    const subtitle = screen.getByText(
      /beautiful notion-powered planning with motion-inspired design/i
    )
    expect(subtitle).toBeInTheDocument()
  })

  it('renders the Connect Notion button', () => {
    render(<Home />)

    const connectButton = screen.getByRole('button', {
      name: /connect notion/i,
    })
    expect(connectButton).toBeInTheDocument()
  })

  it('renders the Learn More button', () => {
    render(<Home />)

    const learnMoreButton = screen.getByRole('button', { name: /learn more/i })
    expect(learnMoreButton).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    render(<Home />)

    // Check for feature card headings
    expect(screen.getByText(/smart scheduling/i)).toBeInTheDocument()
    expect(screen.getByText(/notion integration/i)).toBeInTheDocument()
    expect(screen.getByText(/time tracking/i)).toBeInTheDocument()
  })

  it('renders the Get Started section', () => {
    render(<Home />)

    const getStartedHeading = screen.getByRole('heading', {
      name: /ready to get started/i,
      level: 2,
    })
    expect(getStartedHeading).toBeInTheDocument()

    const getStartedButton = screen.getByRole('button', {
      name: /get started/i,
    })
    expect(getStartedButton).toBeInTheDocument()
  })

  it('renders feature card descriptions', () => {
    render(<Home />)

    expect(
      screen.getByText(/ai-powered scheduling that adapts to your workflow/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/seamlessly sync with your existing notion databases/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/track time spent on activities and get insights/i)
    ).toBeInTheDocument()
  })
})
