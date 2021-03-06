// @flow
import React, { Component } from 'react';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import AddIcon from 'grommet/components/icons/base/Add';
import TrashIcon from 'grommet/components/icons/base/Trash';
import { ConfirmLayer, CarouselSlideWithContentForm, SlideReordering } from '../Shared';
import swapItemOrder, { getNextActiveSlide } from '../Shared/arrayUtils';

type Asset = { path: string };
type CarouselSlide = any;
type ImageSize = 'Small' | 'Medium' | 'Large' | 'XLarge' | 'XXLarge' | 'Full';

type Props = {
  carousel?: CarouselSlide[],
  onSubmit: ?Function,
  imageSize?: ImageSize,
  assetNode: HTMLElement,
}

type State = {
  carousel: CarouselSlide[],
  confirmLayer: boolean,
  activeSlideIndex: number,
  imageSize: ImageSize,
  activeSlideIndex: number,
}

class BlockCarouselWithContentForm extends Component {

  constructor(props: Props) {
    super(props);

    this.state = {
      carousel: props.carousel || [],
      confirmLayer: false,
      activeSlideIndex: 0,
      imageSize: props.imageSize || 'Full',
    };

    this.deleteSlide = this.deleteSlide.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addSlideClick = this.addSlideClick.bind(this);
    this.onTabsClick = this.onTabsClick.bind(this);
    this.toggleConfirm = this.toggleConfirm.bind(this);
    this.onReorderTabs = this.onReorderTabs.bind(this);
    this.onAddAssets = this.onAddAssets.bind(this);
  }

  state: State;

  componentWillMount() {
    if (!this.props.carousel) {
      this.addSlideClick();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.carousel) {
      // Copy Carousel state array.
      this.setState({
        carousel: nextProps.carousel.slice(),
      });
    }
  }

  onSubmit: (state: State) => void;
  onSubmit({ carousel, imageSize }: State) {
    const dataToSubmit = {
      carousel,
      imageSize,
    };

    if (this.props.onSubmit) {
      this.props.onSubmit(dataToSubmit);
    }
  }

  onTabsClick: (tabIndex: number) => void;
  onTabsClick(tabIndex: number) {
    this.setState({ activeSlideIndex: tabIndex });
  }

  onAddAssets: (assets: Asset[]) => void;
  onAddAssets(assets: Asset[]) {
    const newAssets = assets.map(image => ({ image }));
    this.setState({
      activeSlideIndex: (this.state.carousel.length - 1) + (newAssets.length),
      carousel: [
        ...this.state.carousel,
        ...newAssets,
      ],
    });
  }

  onReorderTabs: (direction: 'FORWARDS' | 'BACKWARDS') => void;
  onReorderTabs(direction: 'FORWARDS' | 'BACKWARDS') {
    const { carousel, activeSlideIndex } = this.state;
    const newCarousel = swapItemOrder(carousel, activeSlideIndex, direction);
    const nextActiveSlide = getNextActiveSlide(carousel, activeSlideIndex, direction);
    this.setState({
      carousel: newCarousel,
      activeSlideIndex: nextActiveSlide,
    });
  }

  addSlideClick: () => void;
  addSlideClick() {
    const nextCarouselState = this.state.carousel.slice();
    nextCarouselState.push({
      image: '',
      content: '',
      button: {
        label: '',
        path: '',
      },
    });

    this.setState({
      activeSlideIndex: nextCarouselState.length - 1,
      carousel: nextCarouselState,
    });
  }

  toggleConfirm: () => void;
  toggleConfirm() {
    this.setState({ confirmLayer: !this.state.confirmLayer });
  }

  deleteSlideClick: () => void;
  deleteSlideClick() {
    this.toggleConfirm();
  }

  deleteSlide: (activeIndex: number, event: Event) => void;
  deleteSlide(activeIndex: number, event: Event) {
    event.preventDefault();
    const nextCarouselState = this.state.carousel.slice();
    nextCarouselState.splice(activeIndex, 1);

    this.setState({
      activeSlideIndex: 0,
      carousel: nextCarouselState,
      confirmLayer: false,
    });
  }

  handleChange: (state: State) => void;
  handleChange({ imageSize, ...carouselState }: State) {
    const { carousel, activeSlideIndex } = this.state;
    if (carouselState !== carousel[activeSlideIndex]) {
      const nextCarouselState = [
        ...carousel.slice(0, activeSlideIndex),
        {
          ...carouselState,
        },
        ...carousel.slice(activeSlideIndex + 1),
      ];
      this.setState({ carousel: nextCarouselState });
    }
    if (imageSize !== this.state.imageSize) {
      this.setState({
        imageSize,
      });
    }
  }

  props: Props;

  render() {
    const { assetNode } = this.props;
    const { activeSlideIndex, imageSize } = this.state;
    const form = (
      <Box>
        <CarouselSlideWithContentForm
          onAssetsSelect={this.onAddAssets}
          assetNode={assetNode}
          imageSize={imageSize}
          data={this.state.carousel[activeSlideIndex]}
          onChange={this.handleChange}
          onSubmit={this.onSubmit.bind(this, this.state)}
        />
      </Box>
    );

    const confirmLayer = (this.state.confirmLayer)
      ? (<ConfirmLayer
        name={`Slide ${activeSlideIndex + 1}`} onClose={this.toggleConfirm}
        onSubmit={this.deleteSlide.bind(this, activeSlideIndex)}
      />)
      : undefined;

    return (
      <Box direction="column" pad="medium" colorIndex="light-2">
        {confirmLayer}
        <Box direction="row">
          <Box direction="row" align="center">
            <Button icon={<AddIcon />} label="add slide" onClick={this.addSlideClick} />
            <Box pad="small" />
            <Button
              icon={<TrashIcon />} label="delete slide"
              onClick={this.deleteSlideClick.bind(this, activeSlideIndex)}
            />
          </Box>
        </Box>
        <Box>
          <SlideReordering
            activeSlideIndex={activeSlideIndex}
            carousel={this.state.carousel}
            onTabsClick={this.onTabsClick}
            onReorder={this.onReorderTabs}
          />
        </Box>
        {form}
      </Box>
    );
  }
}

export default BlockCarouselWithContentForm;
